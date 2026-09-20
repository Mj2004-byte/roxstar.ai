import pytest
from backend.agents.context import RoomContext

def test_room_context_history_and_truncation():
    ctx = RoomContext(room_id="test-room-1")
    ctx.add_participant("user_rahul", "Rahul", role="human")

    # Add 25 turns to test sliding window truncation (max history length is 20)
    for i in range(25):
        ctx.add_message("user_rahul", "Rahul", "human", f"Message turn {i+1}")

    assert len(ctx.conversation_history) == 20
    assert ctx.conversation_history[-1].text == "Message turn 25"
    assert ctx.last_user == "user_rahul"

def test_get_recent_history_formatted():
    ctx = RoomContext(room_id="test-room-2")
    ctx.add_message("user_rahul", "Rahul", "human", "AI kya hota hai?")
    ctx.add_message("roxstar-ai-dost", "Roxstar AI Dost", "bot", "AI machine ko smart banati hai.")

    formatted = ctx.get_recent_history_formatted()
    assert "Rahul (human): AI kya hota hai?" in formatted
    assert "Roxstar AI Dost (bot): AI machine ko smart banati hai." in formatted
