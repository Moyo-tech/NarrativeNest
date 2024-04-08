from typing import Dict, List, NamedTuple, Optional, Union
from constants import CHARACTER_MARKER, DESCRIPTION_MARKER, END_MARKER, STOP_MARKER
from .utils import extract_elements




class Character(NamedTuple):
  """Character class."""

  # Name of the character.
  name: str

  # A single sentence describing the character.
  description: str

  @classmethod
  def from_string(cls, text: str):
    elements = text.split(DESCRIPTION_MARKER)
    if len(elements) == 2:
      name = elements[0].strip()
      description = elements[1].strip()
      return cls(name, description)
    else:
      return None


def get_character_description(character: Character) -> str:
  return character.description


class Characters(NamedTuple):
  """Characters class, containing main characters and their descriptions."""

  # A dictionary of character descriptions.
  character_descriptions: Dict[str, str]

  @classmethod
  def from_string(cls, text: str):
    """Parses the characters from the generated text."""
    text = text.strip()

    # Extracts the character descriptions.
    character_descriptions = {}
    elements = extract_elements(text, CHARACTER_MARKER, STOP_MARKER)
    for text_character in elements:
      character = Character.from_string(text_character)
      if character is not None:
        character_descriptions[character.name] = character.description
    return cls(character_descriptions)

  def to_string(self):
    s = '\n'
    for name, description in self.character_descriptions.items():
      s += '\n' + CHARACTER_MARKER + ' ' + name + ' \n' + DESCRIPTION_MARKER + ' '
      s += description + ' ' + STOP_MARKER + '\n'
    s += END_MARKER
    return s


def get_character_descriptions(characters: Characters) -> Dict[str, str]:
  return characters.character_descriptions
