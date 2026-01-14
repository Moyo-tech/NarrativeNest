"""Session store for managing user state across requests."""
import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, Optional, Any, List

from operations.uicontrol import GenerationHistory


@dataclass
class SessionState:
    """State container for a single user session.

    Holds all the stateful data that was previously stored in the
    NarrativeNest class instance.
    """
    generator: Optional[Any] = None
    script_text: Optional[str] = None
    story: Optional[Any] = None

    data_title: Dict = field(default_factory=lambda: {
        "text": "",
        "text_area": None,
        "seed": None
    })

    data_chars: Dict = field(default_factory=lambda: {
        "text": "",
        "text_area": None,
        "seed": None,
        "history": GenerationHistory(),
        "lock": False
    })

    data_scenes: Dict = field(default_factory=lambda: {
        "text": None,
        "text_area": None,
        "seed": None,
        "history": GenerationHistory(),
        "lock": False
    })

    place_names: List = field(default_factory=list)
    place_descriptions: Dict = field(default_factory=dict)

    data_places: Dict = field(default_factory=lambda: {
        "descriptions": {},
        "text_area": {},
        "seed": None
    })

    data_dialogs: Dict = field(default_factory=lambda: {
        "lock": False,
        "text_area": None,
        "seed": None,
        "history": [GenerationHistory() for _ in range(99)],
        "scene": 1
    })

    created_at: datetime = field(default_factory=datetime.now)
    last_accessed: datetime = field(default_factory=datetime.now)


class SessionStore:
    """In-memory session store with TTL-based cleanup.

    Manages user sessions for the FastAPI application, providing
    thread-safe access to session state.
    """

    def __init__(self, ttl_minutes: int = 60):
        """Initialize the session store.

        Args:
            ttl_minutes: Time-to-live for sessions in minutes
        """
        self._sessions: Dict[str, SessionState] = {}
        self._ttl = timedelta(minutes=ttl_minutes)
        self._lock = asyncio.Lock()

    async def get(self, session_id: str) -> Optional[SessionState]:
        """Get a session by ID.

        Args:
            session_id: The session identifier

        Returns:
            SessionState if found, None otherwise
        """
        async with self._lock:
            session = self._sessions.get(session_id)
            if session:
                session.last_accessed = datetime.now()
            return session

    async def create(self, session_id: str) -> SessionState:
        """Create a new session.

        Args:
            session_id: The session identifier

        Returns:
            The newly created SessionState
        """
        async with self._lock:
            session = SessionState()
            self._sessions[session_id] = session
            return session

    async def get_or_create(self, session_id: str) -> SessionState:
        """Get existing session or create new one.

        Args:
            session_id: The session identifier

        Returns:
            Existing or new SessionState
        """
        session = await self.get(session_id)
        if session is None:
            session = await self.create(session_id)
        return session

    async def delete(self, session_id: str) -> bool:
        """Delete a session.

        Args:
            session_id: The session identifier

        Returns:
            True if deleted, False if not found
        """
        async with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False

    async def cleanup_expired(self) -> int:
        """Remove expired sessions.

        Returns:
            Number of sessions removed
        """
        async with self._lock:
            now = datetime.now()
            expired = [
                sid for sid, session in self._sessions.items()
                if now - session.last_accessed > self._ttl
            ]
            for sid in expired:
                del self._sessions[sid]
            return len(expired)

    @property
    def session_count(self) -> int:
        """Get current number of active sessions."""
        return len(self._sessions)


# Global session store instance
session_store = SessionStore(ttl_minutes=60)
