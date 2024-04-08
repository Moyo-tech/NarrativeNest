import collections
from typing import Dict, List, NamedTuple, Optional, Union
from constants import (BEAT_ELEMENT, CHARACTERS_ELEMENT, DESCRIPTION_ELEMENT,
                       DIALOG_MARKER, END_MARKER, MAX_NUM_ATTEMPTS_GET_OUT_OF_LOOP, MAX_NUM_REPETITIONS, MAX_PARAGRAPH_LENGTH, PLOT_ELEMENT, PLACE_ELEMENT,
                       SCENES_MARKER, TITLE_ELEMENT, SAMPLE_LENGTH_TITLE, SAMPLE_LENGTH_PLACE, 
                       MAX_PARAGRAPH_LENGTH_CHARACTERS, MAX_PARAGRAPH_LENGTH_SCENES,
                       )
from entities.character import Characters
from entities.place import Place
from entities.scene import Scene, Scenes
from entities.title import Title
from model.FilterAPI import FilterAPI
from model.LanguageAPI import LanguageAPI
from utils.prefix_summary import prefix_summary

import time


def generate_text(generation_prompt: str,
                  client: LanguageAPI,
                  model_filter: Optional[FilterAPI] = None,
                  sample_length: Optional[int] = None,
                  max_paragraph_length: int = MAX_PARAGRAPH_LENGTH,
                  seed: Optional[int] = None,
                  num_samples: int = 1,
                  max_num_repetitions: Optional[int] = None) -> str:
  """Generate text using the generation prompt."""

  # To prevent lengthy generation loops, we cap the number of calls to the API.
  if sample_length is None:
    sample_length = client.default_sample_length
  max_num_calls = int(max_paragraph_length / sample_length) + 1
  num_calls = 0

  result = ''
  while True:
    prompt = generation_prompt + result
    success, current_seed = False, seed
    while success is False:
      t0 = time.time()
      responses = client.sample(
          prompt=prompt,
          sample_length=sample_length,
          seed=current_seed,
          num_samples=num_samples)
      t1 = time.time()
      # Get the first result from the list of responses
      response = responses[0]
      if model_filter is not None and not model_filter.validateText(response.text):
        return 'Content was filtered out.' + END_MARKER
      if max_num_repetitions:
        success = not detect_loop(
            response.text, max_num_repetitions=max_num_repetitions)
        if not success:
          current_seed += 1
          if current_seed > (seed + MAX_NUM_ATTEMPTS_GET_OUT_OF_LOOP):
            success = True
          else:
            continue
      else:
        success = True

    result = result + response.text
    num_calls += 1

    # Attempt to find the END_MARKER
    index = result.find(END_MARKER)
    if index != -1:
      return result[:index] + END_MARKER

    # Attempt to find the start of a new example
    index = result.find('Example ')
    if index != -1:
      return result[:index] + END_MARKER

    if max_paragraph_length is not None and len(result) > max_paragraph_length:
      return result + END_MARKER
    if num_calls >= max_num_calls:
      return result + END_MARKER

  return result


def generate_text_no_loop(generation_prompt: str,
                          client: LanguageAPI,
                          model_filter: Optional[FilterAPI] = None,
                          sample_length: Optional[int] = None,
                          max_paragraph_length: int = MAX_PARAGRAPH_LENGTH,
                          seed: Optional[int] = None,
                          num_samples: int = 1) -> str:
  """Generate text using the generation prompt, without any loop."""
  return generate_text(
      generation_prompt=generation_prompt,
      client=client,
      model_filter=model_filter,
      sample_length=sample_length,
      max_paragraph_length=sample_length,
      seed=seed,
      max_num_repetitions=None,
      num_samples=num_samples)


def generate_title(storyline: str,
                   prefixes: Dict[str, str],
                   client: LanguageAPI,
                   model_filter: Optional[FilterAPI] = None,
                   seed: Optional[int] = None,
                   num_samples: int = 1):
  """Generate a title given a storyline, and client."""

  # Combine the prompt and storyline as a helpful generation prefix
  titles_prefix = prefixes['TITLES_PROMPT'] + storyline + ' ' + TITLE_ELEMENT
  title_text = generate_text_no_loop(
      generation_prompt=titles_prefix,
      client=client,
      model_filter=model_filter,
      sample_length=SAMPLE_LENGTH_TITLE,
      seed=seed,
      num_samples=num_samples)
  title = Title.from_string(TITLE_ELEMENT + title_text)
  return (title, titles_prefix)


def generate_characters(
    storyline: str,
    prefixes: Dict[str, str],
    client: LanguageAPI,
    model_filter: Optional[FilterAPI] = None,
    seed: Optional[int] = None,
    max_paragraph_length: int = (MAX_PARAGRAPH_LENGTH_CHARACTERS),
    num_samples: int = 1):
  """Generate characters given a storyline, prompt, and client."""

  # Combine the prompt and storyline as a helpful generation prefix
  characters_prefix = prefixes['CHARACTERS_PROMPT'] + storyline
  characters_text = generate_text(
      generation_prompt=characters_prefix,
      client=client,
      model_filter=model_filter,
      seed=seed,
      max_paragraph_length=max_paragraph_length,
      num_samples=num_samples)
  characters = Characters.from_string(characters_text)

  return (characters, characters_prefix)


def generate_scenes(storyline: str,
                    character_descriptions: Dict[str, str],
                    prefixes: Dict[str, str],
                    client: LanguageAPI,
                    model_filter: Optional[FilterAPI] = None,
                    seed: Optional[int] = None,
                    max_paragraph_length: int = (MAX_PARAGRAPH_LENGTH_SCENES),
                    num_samples: int = 1):
  """Generate scenes given storyline, prompt, main characters, and client."""

  scenes_prefix = prefixes['SCENE_PROMPT'] + storyline + '\n'
  for name in character_descriptions:
    scenes_prefix += character_descriptions[name] + '\n'
  scenes_prefix += '\n' + SCENES_MARKER
  scenes_text = generate_text(
      generation_prompt=scenes_prefix,
      client=client,
      model_filter=model_filter,
      seed=seed,
      max_paragraph_length=max_paragraph_length,
      num_samples=num_samples)
  scenes = Scenes.from_string(scenes_text)

  return (scenes, scenes_prefix)


def generate_place_descriptions(storyline: str,
                                scenes: Scenes,
                                prefixes: Dict[str, str],
                                client: LanguageAPI,
                                model_filter: Optional[FilterAPI] = None,
                                seed: Optional[int] = None,
                                num_samples: int = 1):
  """Generate a place description given a scene object and a client."""

  place_descriptions = {}

  # Get unique place names from the scenes.
  unique_place_names = set([scene.place for scene in scenes.scenes])

  # Build a unique place prefix prompt.
  place_prefix = prefixes['SETTING_PROMPT'] + storyline + '\n'

  # Build a list of place descriptions for each place
  place_prefixes = []
  for place_name in unique_place_names:
    place_suffix = Place.format_prefix(place_name)
    place_text = generate_text(
        generation_prompt=place_prefix + place_suffix,
        client=client,
        model_filter=model_filter,
        sample_length=SAMPLE_LENGTH_PLACE,
        seed=seed,
        num_samples=num_samples)
    place_text = place_suffix + place_text
    place_descriptions[place_name] = Place.from_string(place_name, place_text)
    place_prefixes.append(place_prefix + place_suffix)

  return (place_descriptions, place_prefixes)



def detect_loop(text: str, max_num_repetitions: int = MAX_NUM_REPETITIONS):
  """Detect loops in generated text."""

  blocks = text.split('\n\n')
  num_unique_blocks = collections.Counter(blocks)
  for block in blocks:
    num_repetitions = num_unique_blocks[block]
    if num_repetitions > max_num_repetitions:
      print(f'Detected {num_repetitions} repetitions of block:\n{block}')
      return True
  return False


def generate_dialog(storyline: str,
                    scenes: List[Scene],
                    character_descriptions: Dict[str, str],
                    place_descriptions: Dict[str, Place],
                    prefixes: Dict[str, str],
                    max_paragraph_length: int,
                    client: LanguageAPI,
                    model_filter: Optional[FilterAPI] = None,
                    max_num_repetitions: Optional[int] = None,
                    seed: Optional[int] = None,
                    num_samples: int = 1):
  """Generate dialog given a scene object and a client."""

  scene = scenes[-1]

  place_t = PLACE_ELEMENT + scene.place + '\n'
  if scene.place in place_descriptions:
    place_description = place_descriptions[scene.place]
    if place_description:
      place_t += DESCRIPTION_ELEMENT + place_description.description
      place_t += '\n'

  # Build the characters information for the scene
  characters_t = ''
  if character_descriptions:
    characters_t += CHARACTERS_ELEMENT
    for name in character_descriptions:
      if name in scene.beat:
        characters_t += character_descriptions[name] + '\n'

  plot_element_t = PLOT_ELEMENT + scene.plot_element + '\n'

  summary_t = prefix_summary(
      storyline, scenes, concatenate_scenes_in_summary=False)

  beat_t = BEAT_ELEMENT + scene.beat + '\n'

  dialog_prefix = (
      prefixes['DIALOG_PROMPT'] + place_t + characters_t + plot_element_t +
      summary_t + beat_t)
  dialog_prefix += '\n' + DIALOG_MARKER + '\n'

  dialog = generate_text(
      generation_prompt=dialog_prefix,
      client=client,
      model_filter=model_filter,
      seed=seed,
      max_paragraph_length=max_paragraph_length,
      max_num_repetitions=max_num_repetitions,
      num_samples=num_samples)

  return (dialog, dialog_prefix)

