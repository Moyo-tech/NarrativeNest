import difflib
from typing import Dict, List, NamedTuple, Optional, Union
from entities.scene import Scene



def diff_prompt_change_str(prompt_before: str, prompt_after: str) -> str:
  """Return a text diff on prompt sets `prompt_before` and `prompt_after`."""

  # For the current element, compare prompts line by line.
  res = difflib.unified_diff(
      prompt_before.split('\n'), prompt_after.split('\n'))
  diff = ''
  for line in res:
    line = line.strip()
    if line != '---' and line != '+++' and not line.startswith('@@'):
      if len(line) > 1 and (line.startswith('+') or line.startswith('-')):
        diff += line + '\n'
  if diff.endswith('\n'):
    diff = diff[:-1]
  return diff


def diff_prompt_change_list(prompt_before: List[str],
                            prompt_after: List[str]) -> str:
  """Return a text diff on prompt sets `prompt_before` and `prompt_after`."""

  # Handle deletions and insertions.
  len_before = len(prompt_before)
  len_after = len(prompt_after)
  if len_before > len_after:
    return 'Deleted element'
  if len_before < len_after:
    return 'Added new element'

  diffs = [
      diff_prompt_change_str(a, b)
      for (a, b) in zip(prompt_before, prompt_after)
  ]
  return '\n'.join([diff for diff in diffs if len(diff) > 0])


def diff_prompt_change_scenes(prompt_before: List[Scene],
                              prompt_after: List[Scene]) -> str:
  """Return a text diff on prompt sets `prompt_before` and `prompt_after`."""

  # Handle deletions and insertions.
  len_before = len(prompt_before)
  len_after = len(prompt_after)
  if len_before > len_after:
    return 'Deleted element'
  if len_before < len_after:
    return 'Added new element'

  diffs = [
      diff_prompt_change_list([a.place, a.plot_element, a.beat],
                              [b.place, b.plot_element, b.beat])
      for (a, b) in zip(prompt_before, prompt_after)
  ]
  return '\n'.join([diff for diff in diffs if len(diff) > 0])


def diff_prompt_change_dict(prompt_before: Dict[str, str],
                            prompt_after: Dict[str, str]) -> str:
  """Return a text diff on prompt sets `prompt_before` and `prompt_after`."""

  # Loop over the keys in the prompts to compare them one by one.
  keys_before = sorted(prompt_before.keys())
  keys_after = sorted(prompt_after.keys())
  diffs = [
      diff_prompt_change_str(a, b) for (a, b) in zip(keys_before, keys_after)
  ]
  diff_keys = '\n'.join([diff for diff in diffs if len(diff) > 0])
  # Loop over the values in the prompts to compare them one by one.
  values_before = sorted(prompt_before.values())
  values_after = sorted(prompt_after.values())
  diffs = [
      diff_prompt_change_str(a, b)
      for (a, b) in zip(values_before, values_after)
  ]
  diff_values = '\n'.join([diff for diff in diffs if len(diff) > 0])
  return diff_keys + diff_values

