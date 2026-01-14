"""Async wrapper for Groq API client using ThreadPoolExecutor."""
import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Optional, List

from model.LanguageAPI import LanguageAPI, LanguageResponse

# Thread pool for running sync Groq calls
_executor = ThreadPoolExecutor(max_workers=10)


class AsyncGroqAPI:
    """Async wrapper for the synchronous Groq API client.

    Uses ThreadPoolExecutor to run blocking Groq SDK calls without
    blocking the async event loop.
    """

    def __init__(self, sync_client: LanguageAPI):
        """Initialize with an existing sync Groq client.

        Args:
            sync_client: The synchronous LanguageAPI client to wrap
        """
        self._sync_client = sync_client

    @property
    def default_sample_length(self) -> int:
        """Get default sample length from sync client."""
        return self._sync_client._sample_length

    @property
    def seed(self) -> Optional[int]:
        """Get seed from sync client."""
        return self._sync_client._seed

    @property
    def model(self) -> Optional[str]:
        """Get model name from sync client."""
        return self._sync_client._model

    async def sample_async(
        self,
        prompt: str,
        sample_length: Optional[int] = None,
        seed: Optional[int] = None,
        num_samples: int = 1
    ) -> List[LanguageResponse]:
        """Async version of sample using thread pool.

        Args:
            prompt: The prompt to send to the model
            sample_length: Optional length of text to sample
            seed: Optional random seed
            num_samples: Number of samples to generate

        Returns:
            List of LanguageResponse objects
        """
        loop = asyncio.get_event_loop()
        func = partial(
            self._sync_client.sample,
            prompt=prompt,
            sample_length=sample_length,
            seed=seed,
            num_samples=num_samples
        )
        return await loop.run_in_executor(_executor, func)

    def sample(
        self,
        prompt: str,
        sample_length: Optional[int] = None,
        seed: Optional[int] = None,
        num_samples: int = 1
    ) -> List[LanguageResponse]:
        """Synchronous sample method for compatibility.

        Delegates to the underlying sync client.
        """
        return self._sync_client.sample(
            prompt=prompt,
            sample_length=sample_length,
            seed=seed,
            num_samples=num_samples
        )
