from typing import Dict, List, NamedTuple, Optional, Union
from constants import DESCRIPTION_ELEMENT, END_MARKER, PLACE_ELEMENT
from .utils import extract_elements


class Place(NamedTuple):
  """Place class."""

  # Place name.
  name: str

  # Place description.
  description: str

  @classmethod
  def format_name(cls, name: str):
    if name.find('.') == -1:
      name = name + '.'
    return name

  @classmethod
  def from_string(cls, place_name: str, place_text: str):
    place_text += END_MARKER
    description = extract_elements(place_text, DESCRIPTION_ELEMENT, END_MARKER)
    return cls(place_name, description[0])

  @classmethod
  def format_prefix(cls, name):
    s = PLACE_ELEMENT + name + '\n' + DESCRIPTION_ELEMENT
    return s

  def to_string(self):
    s = self.format_prefix(self.name) + self.description + '\n\n'
    return s


def get_place_description(place: Place):
  return place.description