from typing import Dict, List, NamedTuple, Optional, Union

_MAX_RETRIES = 10
_TIMEOUT = 120.0


class LanguageResponse(NamedTuple):
  prompt: str
  prompt_length: int
  text: str
  text_length: int


class LanguageAPI:
  """Language model wrapper."""

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
      model_param: Model parameter.
      config_sampling: Sampleing parameters.
      seed: Random seed for sampling.
      max_retries: Maximum number of retries for the remote API.
      timeout: Maximum waiting timeout
    """
    self._sample_length = sample_length
    self._model = model
    self._model_param = model_param
    self._config_sampling = config_sampling
    self._seed = seed
    self._max_retries = max_retries
    self._timeout = timeout

  @property
  def default_sample_length(self):
    return self._sample_length

  @property
  def model(self):
    return self._model

  @property
  def model_param(self):
    return self._model_param

  @property
  def model_metadata(self):
    return None

  @property
  def seed(self):
    return self._seed

  @property
  def config_sampling(self):
    return self._config_sampling

  def sample(self,
             prompt: str,
             sample_length: Optional[int] = None,
             seed: Optional[int] = None,
             num_samples: int = 1):
    """Sample model with provided prompt, optional sample_length and seed."""
    raise NotImplementedError('sample method not implemented in generic class')
