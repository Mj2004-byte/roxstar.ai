import asyncio
import time
from enum import Enum
from typing import Optional, Callable, Dict, List

class ResponseState(str, Enum):
    IDLE = "IDLE"
    THINKING = "THINKING"
    SPEAKING = "SPEAKING"
    INTERRUPTED = "INTERRUPTED"
    COOLDOWN = "COOLDOWN"

class TurnManager:
    def __init__(self, cooldown_seconds: float = 1.0):
        self.state: ResponseState = ResponseState.IDLE
        self.current_speaker: Optional[str] = None # identity of current bot or user
        self.lock = asyncio.Lock()
        self.cooldown_seconds: float = cooldown_seconds
        self.last_speech_time: float = 0.0
        self._cancel_callbacks: List[Callable[[], None]] = []

    def register_cancel_callback(self, callback: Callable[[], None]):
        self._cancel_callbacks.append(callback)

    def clear_cancel_callbacks(self):
        self._cancel_callbacks.clear()

    async def acquire_lock(self, bot_id: str) -> bool:
        """Attempt to acquire speaking lock for a bot."""
        async with self.lock:
            # Check cooldown
            if time.time() - self.last_speech_time < self.cooldown_seconds and self.state == ResponseState.COOLDOWN:
                return False

            if self.state in [ResponseState.IDLE, ResponseState.COOLDOWN]:
                self.state = ResponseState.THINKING
                self.current_speaker = bot_id
                return True
            return False

    async def update_state(self, new_state: ResponseState, speaker_id: Optional[str] = None):
        async with self.lock:
            self.state = new_state
            if speaker_id is not None:
                self.current_speaker = speaker_id
            if new_state in [ResponseState.IDLE, ResponseState.COOLDOWN]:
                self.last_speech_time = time.time()

    async def handle_interruption(self, interrupter_id: str) -> bool:
        """Trigger interruption if a user speaks while bot is thinking or speaking."""
        async with self.lock:
            if self.state in [ResponseState.THINKING, ResponseState.SPEAKING]:
                previous_bot = self.current_speaker
                self.state = ResponseState.INTERRUPTED
                
                # Execute registered cancellation callbacks (cancel TTS streams, abort tasks)
                for cb in self._cancel_callbacks:
                    try:
                        cb()
                    except Exception as e:
                        pass
                self._cancel_callbacks.clear()

                self.current_speaker = None
                self.state = ResponseState.IDLE
                self.last_speech_time = time.time()
                return True
            return False

    async def release_lock(self, bot_id: str):
        async with self.lock:
            if self.current_speaker == bot_id:
                self.state = ResponseState.COOLDOWN
                self.current_speaker = None
                self.last_speech_time = time.time()
                # Auto transition from COOLDOWN to IDLE after cooldown period in background task if needed
