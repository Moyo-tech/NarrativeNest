from typing import Dict, List, NamedTuple, Optional, Union
from entities.place import Place
from .scene import Scenes

class Story(NamedTuple):
  """Story class."""

  # A storyline is a single sentence summary of the whole plot.
  storyline: str

  # A title for the story.
  title: str

  # Map from character names to full descriptions.
  character_descriptions: Dict[str, str]

  # Map from place names to full descriptions.
  place_descriptions: Dict[str, Place]

  # List of scenes.
  scenes: Scenes

  # List of dialogs, one for each scene.
  dialogs: List[str]

