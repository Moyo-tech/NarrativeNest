def render_prompts(prompts):
  """Render the prompts."""

  def _format_prompt(prompt, name):
    prompt_str = '=' * 80 + '\n'
    prompt_str += 'PROMPT (' + name + ')\n'
    prompt_str += '=' * 80 + '\n\n'
    prompt_str += str(prompt) + '\n\n'
    return prompt_str

  prompts_str = _format_prompt(prompts['title'], 'title')
  prompts_str += _format_prompt(prompts['characters'], 'characters')
  prompts_str += _format_prompt(prompts['scenes'], 'scenes')
  places = prompts['places']
  if places is not None:
    for k, prompt in enumerate(places):
      prompts_str += _format_prompt(prompt, 'place ' + str(k + 1))
  dialogs = prompts['dialogs']
  if dialogs is not None:
    for k, prompt in enumerate(dialogs):
      prompts_str += _format_prompt(prompt, 'dialog ' + str(k + 1))
  return prompts_str
