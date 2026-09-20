import pytest
import asyncio
from backend.services.stt import STTService
from backend.services.llm import LLMService
from backend.services.tts import TTSService

@pytest.mark.asyncio
async def test_stt_failure_graceful_fallback():
    stt = STTService(provider="invalid-provider")
    res = await stt.transcribe_audio_bytes(b"")
    assert "text" in res
    assert res["provider"] == "mock"

@pytest.mark.asyncio
async def test_llm_failure_graceful_fallback():
    llm = LLMService(model="nonexistent-model")
    res = await llm.generate_response("System prompt", "AI kya hota hai?", [])
    assert len(res["text"]) > 0
    assert "technology" in res["text"].lower() or "smart" in res["text"].lower()

@pytest.mark.asyncio
async def test_tts_failure_graceful_fallback():
    tts = TTSService(provider="invalid-provider")
    res = await tts.synthesize("Ek second ruk jao")
    assert "audio_bytes" in res
    assert len(res["audio_bytes"]) > 0
