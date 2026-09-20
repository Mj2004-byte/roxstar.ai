# Roxstar AI Voice Room Assistant - Architecture Overview

## 1. High-Level Architecture

The Roxstar AI Voice Room Assistant is built on a real-time, event-driven audio and data pipeline using LiveKit, Next.js, and Python FastAPI microservices.

```mermaid
flowchart TD
    subgraph Frontend ["Frontend (Next.js + LiveKit Web SDK)"]
        UI[Room UI & Controls]
        AudioIn[User Audio Input]
        TextIn[Text Chat Input]
        AudioOut[Bot Audio Output]
        TranscriptView[Real-time Transcript & Status]
    end

    subgraph LiveKit ["LiveKit Real-Time Server"]
        Room[LiveKit Audio/Data Room]
    end

    subgraph Backend ["Backend (FastAPI & LiveKit Agents)"]
        TokenServer[Token API Server]
        LKWorker[LiveKit Multi-Agent Worker]
        
        subgraph Pipeline ["Audio & Conversation Processing Pipeline"]
            SpeakerID[Speaker Identification]
            STTEngine[STT Service - Deepgram/Whisper]
            LangDetect[Language & Hinglish Detection]
            BotRouter[Bot Router]
            TurnMgr[Turn Manager & Response Lock]
            RoomCtx[Shared Room Context]
            SpkMem[Speaker Isolated Memory]
            LLMEngine[LLM Service - OpenAI GPT-4o]
            TTSEngine[TTS Service - ElevenLabs/OpenAI]
        end

        DostAgent["Roxstar AI Dost (Male Persona)"]
        SathiAgent["Roxstar AI Sathi (Female Persona)"]
    end

    AudioIn -->|WebRTC Audio Stream| Room
    TextIn -->|Data Packet / REST| Room
    Room -->|Audio Stream| SpeakerID
    SpeakerID --> STTEngine
    STTEngine --> LangDetect
    LangDetect --> BotRouter
    
    TextIn --> BotRouter

    BotRouter -->|Check Address / Intent / Relevance| TurnMgr
    TurnMgr -->|Acquire Speaking Lock| RoomCtx
    RoomCtx --> SpkMem
    SpkMem --> LLMEngine
    LLMEngine -->|Target Bot Persona System Prompt| TTSEngine
    
    TTSEngine -->|Audio Stream| LKWorker
    LKWorker -->|Publish Audio Track| Room
    Room -->|WebRTC Audio Stream| AudioOut
    Room -->|Data Sync / Transcripts| TranscriptView
```

## 2. Core Components

### A. LiveKit Audio & Data Layer
- **Room Topology**: Supports multiple human participants and 2 distinct AI bot participants (`roxstar-ai-dost`, `roxstar-ai-sathi`).
- **Data Channels**: Transmits real-time transcriptions, active bot states, latency metrics, and text chat messages.

### B. STT (Speech-to-Text)
- Configured for multi-lingual Indian speech (Hindi, Hinglish, English).
- Production default: Deepgram Nova-2 / OpenAI Whisper.
- Streams user voice turns into recognized text.

### C. Bot Router & Intent Engine
- Evaluates if speech/text requires bot intervention.
- Determines whether **AI Dost**, **AI Sathi**, both sequentially, or neither should respond.
- Filters human-to-human banter ("Kal match dekha?") so bots remain silent when not needed.

### D. Turn Manager & Speaking Lock
- Enforces single-speaker lock (`ResponseState`: `IDLE`, `THINKING`, `SPEAKING`, `INTERRUPTED`, `COOLDOWN`).
- Handles user barge-in by immediately sending cancellation signal to TTS and clearing lock.

### E. Multi-Turn Context & Speaker Memory
- `RoomContext`: Sliding conversational window, current topic, last user/bot turn.
- `SpeakerMemory`: Isolated per participant (`participant_id`, `name`, `facts`, `preferences`). Prevents cross-talk or mixing information between users (e.g. Rahul vs Priya).

### F. Personas & Prompts
- **Roxstar AI Dost**: Male, friendly, casual Hinglish/Hindi, knowledgeable buddy style.
- **Roxstar AI Sathi**: Female, warm, expressive, natural Indian conversational style.

### G. TTS (Text-to-Speech)
- High-quality Indian accents configured with separate male/female voice IDs via `.env`.
