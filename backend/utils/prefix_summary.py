from constants import PREVIOUS_ELEMENT, SUMMARY_ELEMENT
from entities.scene import Scene
from typing import Dict, List, NamedTuple, Optional, Union


def prefix_summary(storyline: str,
                   scenes: List[Scene],
                   concatenate_scenes_in_summary: bool = False) -> str:
  """Assemble the summary part of the dialog prefix."""

  summary = SUMMARY_ELEMENT + storyline + '\n'
  if len(scenes) > 1:
    summary += PREVIOUS_ELEMENT + scenes[len(scenes) - 2].beat + '\n'
  return summary
