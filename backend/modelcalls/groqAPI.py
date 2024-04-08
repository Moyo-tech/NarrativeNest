from groq import Groq
import os
from dotenv import load_dotenv
from typing import Dict, List, NamedTuple, Optional, Union
from model.LanguageAPI import _MAX_RETRIES, _TIMEOUT, LanguageAPI, LanguageResponse
from constants import DEFAULT_SEED, MAX_PARAGRAPH_LENGTH, MAX_PARAGRAPH_LENGTH_CHARACTERS, MAX_PARAGRAPH_LENGTH_SCENES, MAX_RETRIES, SAMPLE_LENGTH, SAMPLING_PROB, SAMPLING_TEMP
import os
import sys

# Get the absolute path to the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add the project root directory to sys.path
sys.path.append(project_root)

load_dotenv()



# Initialise the Groq API with your OpenAI credentials.
GROQ_API_KEY = os.getenv("API_KEY")
GROQ_MODEL_NAME = "mixtral-8x7b-32768"
GROQ_SYSTEM_PROMPT = "You are a creative writing assistant for a team of writers. Your goal is to expand on the input text prompt and to generate the continuation of that text without any comments. Be as creative as possible, write rich detailed descriptions and use precise language. Add new original ideas. Finish generation with **END**." #@param {type:"string"}
GROQ_FREQUENCY_PENALTY = 0.2
GROQ_PRESENCE_PENALTY = 0.2
os.environ['GROQ_API_KEY'] = GROQ_API_KEY


class GroqAPI(LanguageAPI):
  """A class wrapping the Groq language model API."""

  def __init__(self,
               sample_length: int,
               model: Optional[str] = None,
               model_param: Optional[str] = None,
               config_sampling: Optional[dict] = None,
               seed: Optional[int] = None,
               max_retries: int = _MAX_RETRIES,
               timeout: float = _TIMEOUT):
    """Initializer.

    Args:
      sample_length: Length of text to sample from model.
      model: The model name to correct to. An error will be raised if it does
        not exist.
      model_param: Custom language model params.
      config_sampling: ConfigDict with parameters.
      seed: Random seed for sampling.
      max_retries: Maximum number of retries for the remote API.
      timeout: Maximum waiting timeout
    """
    super().__init__(sample_length=sample_length,
                     model=model,
                     model_param=model_param,
                     config_sampling=config_sampling,
                     seed=seed,
                     max_retries=max_retries,
                     timeout=timeout)
    self._client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

  @property
  def client(self):
    return self._client

  @property
  def model_metadata(self):
    return {'engine': self._model,
            'model_param': self._model_param,
            'max_tokens': self._sample_length}

  def sample(self,
             prompt: str,
             sample_length: Optional[int] = None,
             seed: Optional[int] = None,
             num_samples: int = 1):
    """Sample model with provided prompt and optional sample_length and seed."""
    if sample_length is None:
      sample_length = self._sample_length
    response = self._client.chat.completions.create(
        model=self._model,
        max_tokens=sample_length,
        temperature=self._config_sampling['temp'],
        top_p=self._config_sampling['prob'],
        messages=[
          {"role": "system", "content": self._model_param},
          {"role": "user", "content": prompt}
        ]
    )
    response_text = ''
    if len(response.choices) > 0:
      response_text = response.choices[0].message.content
    results = [LanguageResponse(text=response_text,
                                text_length=len(response_text),
                                prompt=prompt,
                                prompt_length=len(prompt))]
    return results


# Create the config.
config = {}
config['language_api_name'] = 'Groq'
config['model_param'] = GROQ_SYSTEM_PROMPT
config['model_name'] = GROQ_MODEL_NAME
config['max_retries'] = MAX_RETRIES
config['sample_length'] = SAMPLE_LENGTH
config['max_paragraph_length'] = MAX_PARAGRAPH_LENGTH
config['max_paragraph_length_characters'] = MAX_PARAGRAPH_LENGTH_CHARACTERS
config['max_paragraph_length_scenes'] = MAX_PARAGRAPH_LENGTH_SCENES
config['sampling'] = {}
config['sampling']['prob'] = SAMPLING_PROB
config['sampling']['temp'] = SAMPLING_TEMP
config['prefixes'] = {}
config['file_dir'] = None

# print('Config:')
# for key, value in config.items():
#   if key != 'prefixes':
#     print(f'{key}: {value}')

client = GroqAPI(
    model_param=config['model_param'],
    model=config['model_name'],
    seed=DEFAULT_SEED,
    sample_length=config['sample_length'],
    max_retries=config['max_retries'],
    config_sampling=config['sampling'])

# print(f'Client model metadata: {client.model_metadata}')

# prompt = 'Once upon a time, there was'
# results = client.sample(prompt, sample_length=256)
# if len(results) > 0 and isinstance(results[0], LanguageResponse):
#   print(f'\nPrompt: {prompt}\nResponse: {results[0].text}')