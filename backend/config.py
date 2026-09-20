import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # LiveKit Credentials
    LIVEKIT_URL: str = os.getenv("LIVEKIT_URL", "ws://localhost:7880")
    LIVEKIT_API_KEY: str = os.getenv("LIVEKIT_API_KEY", "devkey")
    LIVEKIT_API_SECRET: str = os.getenv("LIVEKIT_API_SECRET", "secret")

    # LLM Provider Credentials & Models
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq" if os.getenv("GROQ_API_KEY") else "openai")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "groq/compound-mini" if os.getenv("GROQ_API_KEY") else "gpt-4o")

    # STT & TTS Providers
    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "deepgram") # deepgram, whisper, mock
    STT_API_KEY: str = os.getenv("STT_API_KEY", os.getenv("OPENAI_API_KEY", ""))

    TTS_PROVIDER: str = os.getenv("TTS_PROVIDER", "elevenlabs") # elevenlabs, openai, mock
    TTS_API_KEY: str = os.getenv("TTS_API_KEY", os.getenv("OPENAI_API_KEY", ""))

    # Voice IDs for Personas
    TTS_MALE_VOICE_ID: str = os.getenv("TTS_MALE_VOICE_ID", "male_indian_voice_id_dost")
    TTS_FEMALE_VOICE_ID: str = os.getenv("TTS_FEMALE_VOICE_ID", "female_indian_voice_id_sathi")

    # Server Settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
