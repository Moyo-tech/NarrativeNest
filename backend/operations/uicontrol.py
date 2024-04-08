class GenerationAction:
  NEW = 1
  CONTINUE = 2
  REWRITE = 3


class GenerationHistory:
  """Custom data structure to handle the history of GenerationAction edits:

  NEW, CONTINUE or REWRITE. Consecutive REWRITE edits do not add to history.
  """

  def __init__(self):
    self._items = []
    self._actions = []
    self._idx = -1
    self._locked = False

  def _plain_add(self, item, action: GenerationAction):
    self._items.append(item)
    self._actions.append(action)
    self._idx = len(self._items) - 1
    return self._idx

  def add(self, item, action: GenerationAction):
    if len(self._items) == 0 or action != GenerationAction.REWRITE:
      return self._plain_add(item, action)
    last_action = self._actions[-1]
    if last_action != GenerationAction.REWRITE:
      return self._plain_add(item, action)
    self._items[self._idx] = item
    return self._idx

  def previous(self):
    if len(self._items) == 0:
      return None
    self._idx = max(self._idx - 1, 0)
    return self._items[self._idx]

  def next(self):
    if len(self._items) == 0:
      return None
    self._idx = min(self._idx + 1, len(self._items) - 1)
    return self._items[self._idx]