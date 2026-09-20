# Shared Room Context & Speaker Memory Specification

## Data Models

### 1. Room Context (`RoomContext`)

```json
{
  "room_id": "roxstar-voice-room-1",
  "participants": {
    "user_rahul_123": {
      "identity": "user_rahul_123",
      "display_name": "Rahul",
      "role": "human",
      "joined_at": 1758352000
    },
    "user_priya_456": {
      "identity": "user_priya_456",
      "display_name": "Priya",
      "role": "human",
      "joined_at": 1758352010
    },
    "roxstar-ai-dost": {
      "identity": "roxstar-ai-dost",
      "display_name": "Roxstar AI Dost",
      "role": "bot",
      "joined_at": 1758351990
    },
    "roxstar-ai-sathi": {
      "identity": "roxstar-ai-sathi",
      "display_name": "Roxstar AI Sathi",
      "role": "bot",
      "joined_at": 1758351990
    }
  },
  "conversation_history": [
    {
      "id": "msg_001",
      "speaker_id": "user_rahul_123",
      "speaker_name": "Rahul",
      "speaker_role": "human",
      "text": "AI kya hota hai?",
      "timestamp": 1758352020
    },
    {
      "id": "msg_002",
      "speaker_id": "roxstar-ai-dost",
      "speaker_name": "Roxstar AI Dost",
      "speaker_role": "bot",
      "text": "AI ek aisi technology hai jo machine ko smart bana deti hai.",
      "timestamp": 1758352023
    },
    {
      "id": "msg_003",
      "speaker_id": "user_priya_456",
      "speaker_name": "Priya",
      "speaker_role": "human",
      "text": "Thoda aur simple batao.",
      "timestamp": 1758352030
    }
  ],
  "current_topic": "Artificial Intelligence Basics",
  "speaker_memory": {
    "user_rahul_123": {
      "participant_id": "user_rahul_123",
      "name": "Rahul",
      "facts": ["naam Rahul hai", "cricket pasand hai"],
      "preferences": ["likes simple analogies"],
      "previous_topics": ["AI definition"]
    },
    "user_priya_456": {
      "participant_id": "user_priya_456",
      "name": "Priya",
      "facts": [],
      "preferences": [],
      "previous_topics": ["AI explanation request"]
    }
  },
  "active_bot": "roxstar-ai-dost",
  "last_user": "user_priya_456",
  "last_bot": "roxstar-ai-dost",
  "timestamps": {
    "created_at": 1758351990,
    "last_activity": 1758352030
  }
}
```

## Isolation Principles
1. Speaker Memory is partitioned strictly by `participant_id`.
2. When Rahul asks "Maine apne baare mein kya bataya tha?", the system filters `speaker_memory["user_rahul_123"]` and explicitly ignores Priya's memory.
3. Context truncation: `conversation_history` retains sliding window (last 20 messages) to limit token usage while maintaining topic flow.
