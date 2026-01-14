"""Async generation functions with parallel processing support."""
import asyncio
from typing import Dict, List, Optional, Tuple

from constants import (
    BEAT_ELEMENT, CHARACTERS_ELEMENT, DESCRIPTION_ELEMENT,
    DIALOG_MARKER, END_MARKER, MAX_NUM_ATTEMPTS_GET_OUT_OF_LOOP,
    MAX_NUM_REPETITIONS, MAX_PARAGRAPH_LENGTH, PLOT_ELEMENT, PLACE_ELEMENT,
    SAMPLE_LENGTH_PLACE
)
from entities.place import Place
from entities.scene import Scene, Scenes
from model.FilterAPI import FilterAPI
from generate import detect_loop
from utils.prefix_summary import prefix_summary
from services.async_groq import AsyncGroqAPI


async def generate_text_async(
    generation_prompt: str,
    client: AsyncGroqAPI,
    model_filter: Optional[FilterAPI] = None,
    sample_length: Optional[int] = None,
    max_paragraph_length: int = MAX_PARAGRAPH_LENGTH,
    seed: Optional[int] = None,
    num_samples: int = 1,
    max_num_repetitions: Optional[int] = None
) -> str:
    """Async version of generate_text using async Groq client.

    Args:
        generation_prompt: The prompt to generate text from
        client: AsyncGroqAPI client wrapper
        model_filter: Optional content filter
        sample_length: Length of each sample
        max_paragraph_length: Maximum total length
        seed: Random seed for generation
        num_samples: Number of samples per call
        max_num_repetitions: Max repetitions before loop detection

    Returns:
        Generated text string
    """
    if sample_length is None:
        sample_length = client.default_sample_length
    max_num_calls = int(max_paragraph_length / sample_length) + 1
    num_calls = 0

    result = ''
    while True:
        prompt = generation_prompt + result
        success, current_seed = False, seed

        while success is False:
            responses = await client.sample_async(
                prompt=prompt,
                sample_length=sample_length,
                seed=current_seed,
                num_samples=num_samples
            )
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


async def generate_place_descriptions_parallel(
    storyline: str,
    scenes: Scenes,
    prefixes: Dict[str, str],
    client: AsyncGroqAPI,
    model_filter: Optional[FilterAPI] = None,
    seed: Optional[int] = None,
    num_samples: int = 1
) -> Tuple[Dict[str, Place], List[str]]:
    """Generate all place descriptions in parallel.

    Args:
        storyline: The story premise
        scenes: Scenes object containing all scenes
        prefixes: Prompt prefix dictionary
        client: AsyncGroqAPI client
        model_filter: Optional content filter
        seed: Random seed
        num_samples: Number of samples

    Returns:
        Tuple of (place_descriptions dict, place_prefixes list)
    """
    # Get unique place names from the scenes
    unique_place_names = list(set([scene.place for scene in scenes.scenes]))

    # Build the common place prefix prompt
    place_prefix = prefixes['SETTING_PROMPT'] + storyline + '\n'

    async def generate_single_place(place_name: str) -> Tuple[str, Place, str]:
        """Generate description for a single place."""
        place_suffix = Place.format_prefix(place_name)
        place_text = await generate_text_async(
            generation_prompt=place_prefix + place_suffix,
            client=client,
            model_filter=model_filter,
            sample_length=SAMPLE_LENGTH_PLACE,
            seed=seed,
            num_samples=num_samples
        )
        place_text = place_suffix + place_text
        place = Place.from_string(place_name, place_text)
        return (place_name, place, place_prefix + place_suffix)

    # Run all place generations in parallel
    tasks = [generate_single_place(name) for name in unique_place_names]
    results = await asyncio.gather(*tasks)

    # Build the result dictionaries
    place_descriptions = {}
    place_prefixes = []
    for place_name, place, prefix in results:
        place_descriptions[place_name] = place
        place_prefixes.append(prefix)

    return (place_descriptions, place_prefixes)


async def generate_dialog_async(
    storyline: str,
    scenes: List[Scene],
    character_descriptions: Dict[str, str],
    place_descriptions: Dict[str, Place],
    prefixes: Dict[str, str],
    max_paragraph_length: int,
    client: AsyncGroqAPI,
    model_filter: Optional[FilterAPI] = None,
    max_num_repetitions: Optional[int] = None,
    seed: Optional[int] = None,
    num_samples: int = 1
) -> Tuple[str, str]:
    """Async version of generate_dialog.

    Args:
        storyline: Story premise
        scenes: List of scenes up to current
        character_descriptions: Character description dict
        place_descriptions: Place description dict
        prefixes: Prompt prefixes
        max_paragraph_length: Max length of dialog
        client: AsyncGroqAPI client
        model_filter: Optional content filter
        max_num_repetitions: Loop detection threshold
        seed: Random seed
        num_samples: Number of samples

    Returns:
        Tuple of (dialog_text, dialog_prefix)
    """
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

    dialog = await generate_text_async(
        generation_prompt=dialog_prefix,
        client=client,
        model_filter=model_filter,
        seed=seed,
        max_paragraph_length=max_paragraph_length,
        max_num_repetitions=max_num_repetitions,
        num_samples=num_samples
    )

    return (dialog, dialog_prefix)


async def generate_dialogs_parallel(
    storyline: str,
    scenes: Scenes,
    character_descriptions: Dict[str, str],
    place_descriptions: Dict[str, Place],
    prefixes: Dict[str, str],
    max_paragraph_length: int,
    client: AsyncGroqAPI,
    model_filter: Optional[FilterAPI] = None,
    max_num_repetitions: Optional[int] = MAX_NUM_REPETITIONS,
    seed: Optional[int] = None,
    num_samples: int = 1
) -> Tuple[List[str], List[str]]:
    """Generate all scene dialogs in parallel.

    Args:
        storyline: Story premise
        scenes: Scenes object with all scenes
        character_descriptions: Character descriptions dict
        place_descriptions: Place descriptions dict
        prefixes: Prompt prefixes
        max_paragraph_length: Max dialog length
        client: AsyncGroqAPI client
        model_filter: Optional content filter
        max_num_repetitions: Loop detection threshold
        seed: Random seed
        num_samples: Number of samples

    Returns:
        Tuple of (dialogs list, dialog_prompts list)
    """
    async def generate_single_dialog(k: int) -> Tuple[str, str]:
        """Generate dialog for scene at index k."""
        return await generate_dialog_async(
            storyline=storyline,
            scenes=scenes.scenes[:(k + 1)],
            character_descriptions=character_descriptions,
            place_descriptions=place_descriptions,
            prefixes=prefixes,
            max_paragraph_length=max_paragraph_length,
            client=client,
            model_filter=model_filter,
            max_num_repetitions=max_num_repetitions,
            seed=seed,
            num_samples=num_samples
        )

    # Run all dialog generations in parallel
    tasks = [generate_single_dialog(k) for k in range(len(scenes.scenes))]
    results = await asyncio.gather(*tasks)

    dialogs = [r[0] for r in results]
    dialog_prompts = [r[1] for r in results]

    return (dialogs, dialog_prompts)
