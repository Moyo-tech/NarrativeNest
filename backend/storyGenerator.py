from typing import Dict, List, NamedTuple, Optional, Union
from constants import (MAX_NUM_REPETITIONS, 
                       MAX_PARAGRAPH_LENGTH_CHARACTERS, MAX_PARAGRAPH_LENGTH_SCENES, SAMPLE_LENGTH,
                       )

from diffs import diff_prompt_change_dict, diff_prompt_change_scenes, diff_prompt_change_str
from entities.story import Story
from generate import generate_characters, generate_dialog, generate_place_descriptions, generate_scenes, generate_text, generate_title
from model.FilterAPI import FilterAPI
from model.LanguageAPI import LanguageAPI
from entities.character import Characters, get_character_descriptions
from entities.place import Place
from entities.scene import Scene, Scenes
from entities.title import Title
import time
from utils.strip_end import strip_remove_end



class StoryGenerator:
  """Generate a story from the provided storyline, using the client provided."""

  level_names = ('storyline', 'title', 'characters', 'scenes', 'places',
                 'dialogs')

  def __init__(
      self,
      storyline: str,
      prefixes: Dict[str, str],
      max_paragraph_length: int = 1024,
      max_paragraph_length_characters: int = (MAX_PARAGRAPH_LENGTH_CHARACTERS),
      max_paragraph_length_scenes: int = (MAX_PARAGRAPH_LENGTH_SCENES),
      num_samples: int = 1,
      client: Optional[LanguageAPI] = None,
      filter: Optional[FilterAPI] = None):
    self._prefixes = prefixes
    self._max_paragraph_length = max_paragraph_length
    self._max_paragraph_length_characters = max_paragraph_length_characters
    self._max_paragraph_length_scenes = max_paragraph_length_scenes
    self._num_samples = num_samples
    self._client = client
    self._filter = filter

    # Prompts and outputs of the hierarchical generator are organised in levels.
    self.prompts = {
        'title': '',
        'characters': '',
        'scenes': '',
        'places': {
            '': ''
        },
        'dialogs': ['']
    }
    self._title = Title('')
    self._characters = Characters({'': ''})
    self._scenes = Scenes([Scene('', '', '')])
    self._places = {'': Place('', '')}
    self._dialogs = ['']

    # History of interventions.
    self.interventions = {}
    self._set_storyline(storyline)

  def _set_storyline(self, storyline: str):
    """Set storyline and initialise the outputs of the generator."""
    self._level = 0

    # Add period to the end of the storyline, unless there is already one there.
    if storyline.find('.') == -1:
      storyline = storyline + '.'
    self._storyline = storyline

    # Keep track of each storyline intervention.
    timestamp = time.time()
    self.interventions[timestamp] = 'STORYLINE\n' + storyline

  @property
  def seed(self):
    return self._client.seed

  @property
  def title(self) -> Title:
    """Return the title."""
    return self._title

  @property
  def characters(self) -> Characters:
    """Return the characters."""
    return self._characters

  @property
  def scenes(self) -> Scenes:
    """Return the title."""
    return self._scenes

  @property
  def places(self) -> Dict[str, Place]:
    """Return the places."""
    return self._places

  @property
  def dialogs(self) -> List[str]:
    """Return the dialogs."""
    return self._dialogs

  def title_str(self) -> str:
    """Return the title as a string."""
    return self._title.title

  def num_scenes(self) -> int:
    """Return the number of scenes."""
    return self._scenes.num_scenes()

  def step(self,
           level: Optional[int] = None,
           seed: Optional[int] = None,
           idx: Optional[int] = None) -> bool:
    """Step down a level in the hierarchical generation of a story."""

    # Move to the next level of hierarchical generation.
    if level is None:
      level = self._level
    if level < 0 or level >= len(self.level_names):
      raise ValueError('Invalid level encountered on step.')
    level += 1
    self._level = level

    # Keep track of each step intervention.
    timestamp = time.time()
    self.interventions[timestamp] = 'STEP ' + str(level) + '\n'

    if level == 1:
      # Step 1: Generate title given a storyline.
      (title, titles_prefix) = generate_title(
          storyline=self._storyline,
          prefixes=self._prefixes,
          client=self._client,
          model_filter=self._filter,
          num_samples=self._num_samples,
          seed=seed)
      self._title = title
      self.prompts['title'] = titles_prefix
      self.interventions[timestamp] += title.to_string()
      success = len(title.title) > 0
      return success

    if level == 2:
      # Step 2: Generate characters given a storyline.
      (characters, character_prompts) = generate_characters(
          storyline=self._storyline,
          prefixes=self._prefixes,
          client=self._client,
          model_filter=self._filter,
          num_samples=self._num_samples,
          max_paragraph_length=self._max_paragraph_length_characters,
          seed=seed)
      self._characters = characters
      self.prompts['characters'] = character_prompts
      self.interventions[timestamp] += characters.to_string()
      success = len(characters.character_descriptions) > 0
      return success

    if level == 3:
      # Step 3: Generate sequence of scenes given a storyline and characters.
      characters = self._characters
      (scenes, scene_prompts) = generate_scenes(
          storyline=self._storyline,
          character_descriptions=get_character_descriptions(characters),
          prefixes=self._prefixes,
          client=self._client,
          model_filter=self._filter,
          num_samples=self._num_samples,
          max_paragraph_length=self._max_paragraph_length_scenes,
          seed=seed)
      self._scenes = scenes
      self.prompts['scenes'] = scene_prompts
      self.interventions[timestamp] += scenes.to_string()
      success = len(scenes.scenes) > 0
      return success

    if level == 4:
      # Step 4: For each scene, generate place descriptions given place name.
      scenes = self._scenes
      (place_descriptions, place_prompts) = generate_place_descriptions(
          storyline=self._storyline,
          scenes=scenes,
          prefixes=self._prefixes,
          client=self._client,
          model_filter=self._filter,
          num_samples=self._num_samples,
          seed=seed)
      self._places = place_descriptions
      self.prompts['places'] = place_prompts
      for place_name in place_descriptions:
        place = place_descriptions[place_name]
        if place:
          self.interventions[timestamp] += place.to_string()
      num_places = scenes.num_places()
      success = (len(place_descriptions) == num_places) and num_places > 0
      return success

    if level == 5:
      # Step 5: For each scene, generate dialog from scene information.
      title = self._title
      characters = self._characters
      scenes = self._scenes
      place_descriptions = self._places
      if idx is None:
        (dialogs, dialog_prompts) = zip(*[
            generate_dialog(
                storyline=self._storyline,
                scenes=scenes.scenes[:(k + 1)],
                character_descriptions=(characters.character_descriptions),
                place_descriptions=place_descriptions,
                prefixes=self._prefixes,
                max_paragraph_length=self._max_paragraph_length,
                max_num_repetitions=MAX_NUM_REPETITIONS,
                client=self._client,
                model_filter=self._filter,
                num_samples=self._num_samples,
                seed=seed) for k in range(len(scenes.scenes))
        ])
      else:
        num_scenes = self._scenes.num_scenes()
        while len(self._dialogs) < num_scenes:
          self._dialogs.append('')
        while len(self.prompts['dialogs']) < num_scenes:
          self.prompts['dialogs'].append('')
        if idx >= num_scenes or idx < 0:
          raise ValueError('Invalid scene index.')
        dialogs = self._dialogs
        dialog_prompts = self.prompts['dialogs']
        dialogs[idx], dialog_prompts[idx] = generate_dialog(
            storyline=self._storyline,
            scenes=scenes.scenes[:(idx + 1)],
            character_descriptions=(characters.character_descriptions),
            place_descriptions=place_descriptions,
            prefixes=self._prefixes,
            max_paragraph_length=self._max_paragraph_length,
            max_num_repetitions=MAX_NUM_REPETITIONS,
            client=self._client,
            model_filter=self._filter,
            num_samples=self._num_samples,
            seed=seed)
      self._dialogs = dialogs
      self.prompts['dialogs'] = dialog_prompts
      for dialog in dialogs:
        self.interventions[timestamp] += str(dialog)
      return True

  def get_story(self):
    if self._characters is not None:
      character_descriptions = get_character_descriptions(self._characters)
    else:
      character_descriptions = None
    return Story(
        storyline=self._storyline,
        title=self._title.title,
        character_descriptions=character_descriptions,
        place_descriptions=self._places,
        scenes=self._scenes,
        dialogs=self._dialogs)

  def rewrite(self, text, level=0, entity=None):
    if level < 0 or level >= len(self.level_names):
      raise ValueError('Invalid level encountered on step.')
    prompt_diff = None

    if level == 0:
      # Step 0: Rewrite the storyline and begin new story.
      prompt_diff = diff_prompt_change_str(self._storyline, text)
      self._set_storyline(text)

    if level == 1:
      # Step 1: Rewrite the title.
      title = Title.from_string(text)
      prompt_diff = diff_prompt_change_str(self._title.title, title.title)
      self._title = title

    if level == 2:
      # Step 2: Rewrite the characters.
      characters = Characters.from_string(text)
      prompt_diff = diff_prompt_change_dict(
          self._characters.character_descriptions,
          characters.character_descriptions)
      self._characters = characters

    if level == 3:
      # Step 3: Rewrite the sequence of scenes.
      scenes = Scenes.from_string(text)
      prompt_diff = diff_prompt_change_scenes(self._scenes.scenes,
                                              scenes.scenes)
      self._scenes = scenes

    if level == 4:
      # Step 4: For a given place, rewrite its place description.
      place_descriptions = self._places
      if entity in place_descriptions:
        place_prefix = Place.format_prefix(entity)
        text = place_prefix + text
        place = Place.from_string(entity, text)
        prompt_diff = diff_prompt_change_str(self._places[entity].name,
                                             place.name)
        prompt_diff += '\n' + diff_prompt_change_str(
            self._places[entity].description, place.description)

        self._places[entity] = place

    if level == 5:
      # Step 5: Rewrite the dialog of a given scene.
      dialogs = self._dialogs
      num_scenes = len(self._scenes.scenes)
      if entity >= 0 and entity < num_scenes:
        prompt_diff = diff_prompt_change_str(self._dialogs[entity], text)
        self._dialogs[entity] = text

    # Keep track of each rewrite intervention.
    if prompt_diff is not None and len(prompt_diff) > 0:
      timestamp = time.time()
      self.interventions[timestamp] = 'REWRITE ' + self.level_names[level]
      if entity:
        self.interventions[timestamp] += ' ' + str(entity)
      self.interventions[timestamp] += prompt_diff

  def complete(self,
               level=0,
               seed=None,
               entity=None,
               sample_length=SAMPLE_LENGTH):
    if level < 0 or level >= len(self.level_names):
      raise ValueError('Invalid level encountered on step.')
    prompt_diff = None

    if level == 2:
      # Step 2: Complete the characters.
      text_characters = self._characters.to_string()
      text_characters = strip_remove_end(text_characters)
      prompt = self.prompts['characters'] + text_characters
      text = generate_text(
          generation_prompt=prompt,
          client=self._client,
          model_filter=self._filter,
          sample_length=sample_length,
          max_paragraph_length=sample_length,
          seed=seed,
          num_samples=1)
      new_characters = Characters.from_string(text_characters + text)
      prompt_diff = diff_prompt_change_dict(
          self._characters.character_descriptions,
          new_characters.character_descriptions)
      self._characters = new_characters

    if level == 3:
      # Step 3: Complete the sequence of scenes.
      text_scenes = self._scenes.to_string()
      text_scenes = strip_remove_end(text_scenes)
      prompt = self.prompts['scenes'] + text_scenes
      text = generate_text(
          generation_prompt=prompt,
          client=self._client,
          model_filter=self._filter,
          sample_length=sample_length,
          max_paragraph_length=sample_length,
          seed=seed,
          num_samples=1)
      new_scenes = Scenes.from_string(text_scenes + text)
      prompt_diff = diff_prompt_change_scenes(self._scenes.scenes,
                                              new_scenes.scenes)
      self._scenes = new_scenes

    if level == 5:
      # Step 5: Complete the dialog of a given scene.
      dialogs = self._dialogs
      num_scenes = len(self._scenes.scenes)
      while len(self._dialogs) < num_scenes:
        self._dialogs.append('')
      while len(self.prompts['dialogs']) < num_scenes:
        self.prompts['dialogs'].append('')
      if entity >= 0 and entity < num_scenes:
        prompt = (self.prompts['dialogs'][entity] + self._dialogs[entity])
        text = generate_text(
            generation_prompt=prompt,
            client=self._client,
            model_filter=self._filter,
            sample_length=sample_length,
            max_paragraph_length=sample_length,
            seed=seed,
            num_samples=1)
        new_dialog = self._dialogs[entity] + text
        prompt_diff = diff_prompt_change_str(self._dialogs[entity], new_dialog)
        self._dialogs[entity] = new_dialog

    # Keep track of each rewrite intervention.
    if prompt_diff is not None and len(prompt_diff) > 0:
      timestamp = time.time()
      self.interventions[timestamp] = 'COMPLETE ' + self.level_names[level]
      if entity:
        self.interventions[timestamp] += ' ' + str(entity)
      self.interventions[timestamp] += prompt_diff

