import pytest
import asyncio
from backend.services.llm import LLMService

@pytest.mark.asyncio
async def test_llm_language_fallbacks():
    llm = LLMService()
    
    # Hinglish query
    resp1 = await llm.generate_response("You are AI Dost", "AI kya hota hai?", [])
    assert len(resp1["text"]) > 0

    # English query expecting Hinglish reply
    resp2 = await llm.generate_response("You are AI Dost", "Can you explain cloud computing?", [])
    assert len(resp2["text"]) > 0
