import time
import asyncio
from typing import Dict, Any, Optional
from backend.config import settings

class TTSService:
    def __init__(self, provider: Optional[str] = None):
        self.provider = provider or settings.TTS_PROVIDER
        self.api_key = settings.TTS_API_KEY
        self.male_voice_id = settings.TTS_MALE_VOICE_ID
        self.female_voice_id = settings.TTS_FEMALE_VOICE_ID

    async def synthesize(self, text: str, voice_gender: str = "male") -> Dict[str, Any]:
        """Synthesize text to speech audio bytes with latency metrics."""
        start_time = time.time()
        voice_id = self.male_voice_id if voice_gender == "male" else self.female_voice_id

        if self.provider == "elevenlabs" and self.api_key:
            try:
                import httpx
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
                headers = {
                    "xi-api-key": self.api_key,
                    "Content-Type": "application/json"
                }
                payload = {
                    "text": text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
                }
                async with httpx.AsyncClient() as client:
                    resp = await client.post(url, json=payload, headers=headers, timeout=10.0)
                    if resp.status_code == 200:
                        latency = time.time() - start_time
                        return {
                            "audio_bytes": resp.content,
                            "latency_ms": int(latency * 1000),
                            "provider": "elevenlabs",
                            "voice_id": voice_id
                        }
            except Exception as e:
                pass

        if settings.OPENAI_API_KEY:
            try:
                import openai
                client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                voice_name = "onyx" if voice_gender == "male" else "shimmer"
                response = await client.audio.speech.create(
                    model="tts-1",
                    voice=voice_name,
                    input=text
                )
                audio_bytes = response.content
                latency = time.time() - start_time
                return {
                    "audio_bytes": audio_bytes,
                    "latency_ms": int(latency * 1000),
                    "provider": "openai_tts",
                    "voice_id": voice_name
                }
            except Exception as e:
                pass

        # Fallback offline generator producing mock PCM audio bytes
        await asyncio.sleep(0.15)
        latency = time.time() - start_time
        mock_pcm = b"\x00\x00" * 16000 # 1 sec silent/tone PCM buffer
        return {
            "audio_bytes": mock_pcm,
            "latency_ms": int(latency * 1000),
            "provider": "mock",
            "voice_id": voice_id
        }
