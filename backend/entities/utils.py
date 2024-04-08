from typing import Dict, List, NamedTuple, Optional, Union

def extract_elements(text: str, begin: str, end: str) -> List[str]:
  """Extracts elements from a text string given string and ending markers."""

  results = []
  start = 0
  while True:
    start = text.find(begin, start)
    if start == -1:
      return results
    finish = text.find(end, start)
    if finish == -1:
      return results
    results.append(text[start + len(begin):finish].strip())
    start = finish + len(end)