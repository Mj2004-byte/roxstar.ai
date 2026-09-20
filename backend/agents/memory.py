import time
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SpeakerMemory(BaseModel):
    participant_id: str
    name: str = ""
    facts: List[str] = Field(default_factory=list)
    preferences: List[str] = Field(default_factory=list)
    previous_topics: List[str] = Field(default_factory=list)

    def add_fact(self, fact: str):
        if fact not in self.facts:
            self.facts.append(fact)

    def add_preference(self, pref: str):
        if pref not in self.preferences:
            self.preferences.append(pref)

    def add_topic(self, topic: str):
        if topic not in self.previous_topics:
            self.previous_topics.append(topic)

    def summarize(self) -> str:
        summary_parts = []
        if self.name:
            summary_parts.append(f"Name: {self.name}")
        if self.facts:
            summary_parts.append(f"Facts: {', '.join(self.facts)}")
        if self.preferences:
            summary_parts.append(f"Preferences: {', '.join(self.preferences)}")
        return "; ".join(summary_parts) if summary_parts else "No personal memory recorded yet."

class SpeakerMemoryStore:
    def __init__(self):
        self._memories: Dict[str, SpeakerMemory] = {}

    def get_or_create(self, participant_id: str, name: Optional[str] = None) -> SpeakerMemory:
        if participant_id not in self._memories:
            self._memories[participant_id] = SpeakerMemory(
                participant_id=participant_id,
                name=name or participant_id
            )
        elif name and not self._memories[participant_id].name:
            self._memories[participant_id].name = name
        return self._memories[participant_id]

    def extract_facts_from_text(self, participant_id: str, text: str, name: Optional[str] = None) -> None:
        mem = self.get_or_create(participant_id, name)
        lower_text = text.lower()
        
        # Simple extraction heuristics (supplemented by LLM if needed)
        if "mera naam" in lower_text:
            # e.g., "Mera naam Rahul hai"
            parts = text.split("naam")
            if len(parts) > 1:
                name_candidate = parts[1].strip().split()[0].rstrip(".,!?")
                if name_candidate.lower() not in ["hai", "kya", "toh", "is"]:
                    mem.name = name_candidate.capitalize()
                    mem.add_fact(f"naam {mem.name} hai")
                    
        if "my name is" in lower_text:
            parts = text.split("is")
            if len(parts) > 1:
                name_candidate = parts[1].strip().split()[0].rstrip(".,!?")
                mem.name = name_candidate.capitalize()
                mem.add_fact(f"name is {mem.name}")

        if "pasand hai" in lower_text or "mujhe" in lower_text:
            mem.add_fact(text.strip())
        elif "like" in lower_text or "love" in lower_text:
            mem.add_fact(text.strip())
