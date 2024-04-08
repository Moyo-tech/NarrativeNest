from typing import Dict, List, NamedTuple, Optional, Union
from constants import TITLE_ELEMENT  
from constants import END_MARKER  
from .utils import extract_elements

class Title(NamedTuple):
  """Title class."""

  title: str

  @classmethod
  def from_string(cls, text: str):
    title = extract_elements(text, TITLE_ELEMENT, END_MARKER)[0]
    return cls(title)

  def to_string(self):
    s = ''
    s += TITLE_ELEMENT + self.title
    s += END_MARKER
    return s


def get_title(title: Title) -> str:
  return title.title
