from typing import Dict, List, NamedTuple, Optional, Union
from constants import BEAT_ELEMENT, END_MARKER, PLACE_ELEMENT, PLOT_ELEMENT
from .place import Place
from .utils import extract_elements




class Scene(NamedTuple):
  """Scene class."""

  # The name of the place where the scene unfolds.
  place: str

  # Name of the plot element (e.g., Beginning, Middle, Conclusion).
  plot_element: str

  # A short description of action/story/dramatic event occuring in the scene.
  beat: str

  def to_string(self):
    s = PLACE_ELEMENT + ' ' + self.place + '\n'
    s += PLOT_ELEMENT + ' ' + self.plot_element + '\n'
    s += BEAT_ELEMENT + ' ' + self.beat + '\n'
    return s


class Scenes(NamedTuple):
  """Scenes class."""

  # A list of scenes, with place, characters, plot element and beat.
  scenes: List[Scene]

  @classmethod
  def from_string(cls, text: str):
    """Parse scenes from generated scenes_text."""

    places = extract_elements(text, PLACE_ELEMENT, PLOT_ELEMENT)
    plot_elements = extract_elements(text, PLOT_ELEMENT, BEAT_ELEMENT)
    beats = extract_elements(text, BEAT_ELEMENT, '\n')

    # Get the number of complete scenes.
    num_complete_scenes = min([len(places), len(plot_elements), len(beats)])
    scenes = []
    for i in range(num_complete_scenes):
      scenes.append(
          Scene(Place.format_name(places[i]), plot_elements[i], beats[i]))
    scenes = cls(scenes)
    return scenes

  def to_string(self):
    s = ''
    for scene in self.scenes:
      s += '\n' + scene.to_string()
    s += END_MARKER
    return s

  def num_places(self):
    return len(set([scene.place for scene in self.scenes]))

  def num_scenes(self) -> int:
    return len(self.scenes)
