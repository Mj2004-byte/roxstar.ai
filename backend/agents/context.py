import time
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.agents.memory import SpeakerMemory, SpeakerMemoryStore

class MessageTurn(BaseModel):
    id: str
    speaker_id: str
    speaker_name: str
    speaker_role: str # "human" or "bot"
    text: str
    timestamp: float = Field(default_factory=time.time)

class RoomContext:
    def __init__(self, room_id: str = "default-room"):
        self.room_id: str = room_id
        self.participants: Dict[str, Dict[str, Any]] = {}
        self.conversation_history: List[MessageTurn] = []
        self.current_topic: str = "General Room Discussion"
        self.memory_store: SpeakerMemoryStore = SpeakerMemoryStore()
        self.active_bot: Optional[str] = None
        self.last_user: Optional[str] = None
        self.last_bot: Optional[str] = None
        self.timestamps: Dict[str, float] = {
            "created_at": time.time(),
            "last_activity": time.time()
        }
        self.max_history_length: int = 20

    def add_participant(self, participant_id: str, name: str, role: str = "human"):
        self.participants[participant_id] = {
            "identity": participant_id,
            "display_name": name,
            "role": role,
            "joined_at": time.time()
        }
        if role == "human":
            self.memory_store.get_or_create(participant_id, name)

    def remove_participant(self, participant_id: str):
        if participant_id in self.participants:
            del self.participants[participant_id]

    def reset_conversation(self):
        """Clears conversation history and resets active turn state for a fresh session."""
        self.conversation_history.clear()
        self.active_bot = None
        self.last_user = None
        self.last_bot = None
        self.timestamps["last_activity"] = time.time()

    def add_message(self, speaker_id: str, speaker_name: str, speaker_role: str, text: str) -> MessageTurn:
        msg_id = f"msg_{len(self.conversation_history) + 1}_{int(time.time())}"
        turn = MessageTurn(
            id=msg_id,
            speaker_id=speaker_id,
            speaker_name=speaker_name,
            speaker_role=speaker_role,
            text=text,
            timestamp=time.time()
        )
        self.conversation_history.append(turn)
        self.timestamps["last_activity"] = time.time()

        if speaker_role == "human":
            self.last_user = speaker_id
            self.memory_store.extract_facts_from_text(speaker_id, text, speaker_name)
        elif speaker_role == "bot":
            self.last_bot = speaker_id
            self.active_bot = speaker_id

        # Context truncation to manage token count and costs
        if len(self.conversation_history) > self.max_history_length:
            self.conversation_history = self.conversation_history[-self.max_history_length:]

        return turn

    def get_recent_history_formatted(self, limit: int = 10) -> str:
        recent = self.conversation_history[-limit:]
        formatted = []
        for msg in recent:
            formatted.append(f"{msg.speaker_name} ({msg.speaker_role}): {msg.text}")
        return "\n".join(formatted)

    def get_speaker_memory_summary(self, speaker_id: str) -> str:
        mem = self.memory_store.get_or_create(speaker_id)
        return mem.summarize()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "room_id": self.room_id,
            "participants": self.participants,
            "conversation_history": [msg.model_dump() for msg in self.conversation_history],
            "current_topic": self.current_topic,
            "speaker_memory": {pid: mem.model_dump() for pid, mem in self.memory_store._memories.items()},
            "active_bot": self.active_bot,
            "last_user": self.last_user,
            "last_bot": self.last_bot,
            "timestamps": self.timestamps
        }
