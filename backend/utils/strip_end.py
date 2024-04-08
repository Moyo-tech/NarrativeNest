from constants import END_MARKER


def strip_remove_end(text: str) -> str:
  text = text.strip()
  end_marker_stripped = END_MARKER.strip()
  if text.endswith(end_marker_stripped):
    text = text[:-len(end_marker_stripped)]
  return text