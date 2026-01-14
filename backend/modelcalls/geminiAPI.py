"""Gemini API client for text generation.

Replaces the Groq API client with Google's Gemini API.
"""
import os
import sys
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv

from model.LanguageAPI import _MAX_RETRIES, _TIMEOUT, LanguageAPI, LanguageResponse
from constants import (
    DEFAULT_SEED, MAX_PARAGRAPH_LENGTH, MAX_PARAGRAPH_LENGTH_CHARACTERS,
    MAX_PARAGRAPH_LENGTH_SCENES, MAX_RETRIES, SAMPLE_LENGTH, SAMPLING_PROB, SAMPLING_TEMP
)

# Get the absolute path to the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

load_dotenv()

# Gemini configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME = "gemini-2.0-flash"  # Fast and capable model
GEMINI_SYSTEM_PROMPT = (
    "You are a creative writing assistant for a team of writers. "
    "Your goal is to expand on the input text prompt and to generate the continuation "
    "of that text without any comments. Be as creative as possible, write rich detailed "
    "descriptions and use precise language. Add new original ideas. Finish generation with **END**."
)

# Configure the Gemini API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class GeminiAPI(LanguageAPI):
    """A class wrapping the Google Gemini language model API."""

    def __init__(
        self,
        sample_length: int,
        model: Optional[str] = None,
        model_param: Optional[str] = None,
        config_sampling: Optional[dict] = None,
        seed: Optional[int] = None,
        max_retries: int = _MAX_RETRIES,
        timeout: float = _TIMEOUT
    ):
        """Initialize the Gemini API client.

        Args:
            sample_length: Length of text to sample from model.
            model: The model name to use.
            model_param: System prompt for the model.
            config_sampling: Dict with sampling parameters (temp, prob).
            seed: Random seed for sampling (not directly supported by Gemini).
            max_retries: Maximum number of retries for the API.
            timeout: Maximum waiting timeout.
        """
        super().__init__(
            sample_length=sample_length,
            model=model,
            model_param=model_param,
            config_sampling=config_sampling,
            seed=seed,
            max_retries=max_retries,
            timeout=timeout
        )

        # Create the Gemini model with system instruction
        self._client = genai.GenerativeModel(
            model_name=self._model,
            system_instruction=self._model_param,
            generation_config=genai.GenerationConfig(
                max_output_tokens=sample_length,
                temperature=config_sampling.get('temp', 0.7) if config_sampling else 0.7,
                top_p=config_sampling.get('prob', 0.9) if config_sampling else 0.9,
            )
        )

    @property
    def client(self):
        """Return the Gemini client."""
        return self._client

    @property
    def model_metadata(self):
        """Return model metadata."""
        return {
            'engine': self._model,
            'model_param': self._model_param,
            'max_tokens': self._sample_length
        }

    def sample(
        self,
        prompt: str,
        sample_length: Optional[int] = None,
        seed: Optional[int] = None,
        num_samples: int = 1
    ):
        """Sample model with provided prompt.

        Args:
            prompt: The text prompt to send to the model.
            sample_length: Optional override for max tokens.
            seed: Random seed (not directly used by Gemini).
            num_samples: Number of samples (currently only 1 supported).

        Returns:
            List of LanguageResponse objects.
        """
        # If sample_length is different, create a new generation config
        if sample_length is not None and sample_length != self._sample_length:
            generation_config = genai.GenerationConfig(
                max_output_tokens=sample_length,
                temperature=self._config_sampling.get('temp', 0.7) if self._config_sampling else 0.7,
                top_p=self._config_sampling.get('prob', 0.9) if self._config_sampling else 0.9,
            )
            response = self._client.generate_content(
                prompt,
                generation_config=generation_config
            )
        else:
            response = self._client.generate_content(prompt)

        # Extract text from response
        response_text = ''
        try:
            if response.text:
                response_text = response.text
        except ValueError:
            # Handle blocked responses or other issues
            response_text = ''

        results = [
            LanguageResponse(
                text=response_text,
                text_length=len(response_text),
                prompt=prompt,
                prompt_length=len(prompt)
            )
        ]
        return results


# Create the config
config = {}
config['language_api_name'] = 'Gemini'
config['model_param'] = GEMINI_SYSTEM_PROMPT
config['model_name'] = GEMINI_MODEL_NAME
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

# Create the client instance
client = GeminiAPI(
    model_param=config['model_param'],
    model=config['model_name'],
    seed=DEFAULT_SEED,
    sample_length=config['sample_length'],
    max_retries=config['max_retries'],
    config_sampling=config['sampling']
)
