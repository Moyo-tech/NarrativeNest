


from constants import BEAT_ELEMENT, PLACE_ELEMENT, PLOT_ELEMENT
from entities.place import get_place_description
from entities.story import Story
from utils.strip_end import strip_remove_end

def render_story(story: Story) -> str:
  """Render the story in fountain format."""

  lines = []
  lines.append(f'Title: {story.title}')
  lines.append('Author: Co-written by ________ and Dramatron')
  lines.append(
      'Dramatron was developed by Piotr Mirowski and Kory W. Mathewson, '
      'with additional contributions by Juliette Love and Jaylen Pittman, '
      'and is based on a prototype by Richard Evans.')
  lines.append('Dramatron relies on user-provided language models.')
  lines.append('')
  lines.append('====')
  lines.append('')

  lines.append(f'The script is based on the storyline:\n{story.storyline}')
  lines.append('')
  if story.character_descriptions is not None:
    for name, description in story.character_descriptions.items():
      lines.append(f'{name}: {description}')
      lines.append('')

  # For each scene, render scene information.
  if story.scenes is not None:
    scenes = story.scenes.scenes
    for i, scene in enumerate(scenes):
      lines.append(f'Scene {i+1}')
      lines.append(f'{PLACE_ELEMENT}{scene.place}')
      lines.append(f'{PLOT_ELEMENT}{scene.plot_element}')
      lines.append(f'{BEAT_ELEMENT}{scene.beat}')
      lines.append('')
  else:
    scenes = []

  lines.append('====')
  lines.append('')

  # For each scene, render the scene's place description, characters and dialog.
  for i, scene in enumerate(scenes):

    # Output the places and place descriptions.
    lines.append(f'INT/EXT. {scene.place} - Scene {i+1}')
    place_descriptions = story.place_descriptions
    if (not place_appears_earlier(scene.place, story, i) and
        place_descriptions is not None and scene.place in place_descriptions):
      lines.append('')
      lines.append(get_place_description(place_descriptions[scene.place]))

    # Output the characters and descriptions.
    lines.append('')
    for c in story.character_descriptions.keys():
      if c in scene.beat and not character_appears_earlier(c, story, i):
        lines.append(story.character_descriptions[c])

    # Output the dialog.
    if story.dialogs is not None and len(story.dialogs) > i:
      lines.append('')
      lines_dialog = strip_remove_end(str(story.dialogs[i]))
      lines.append(lines_dialog)
      lines.append('')
      lines.append('')

  return '\n'.join(lines)


def place_appears_earlier(place: str, story: Story, index: int) -> bool:
  """Return True if the place appears earlier in the story."""

  for i in range(index):
    scene = story.scenes.scenes[i]
    if scene.place == place:
      return True
  return False


def character_appears_earlier(character: str, story: Story, index: int) -> bool:
  """Return True if the character appears earlier in the story."""

  for i in range(index):
    scene = story.scenes.scenes[i]
    if character in scene.beat:
      return True
  return False
