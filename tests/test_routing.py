import pytest
from backend.agents.router import BotRouter
from backend.agents.context import RoomContext

def test_routing_explicit_dost():
    router = BotRouter()
    ctx = RoomContext()
    decision = router.route("user_1", "AI Dost, tum answer karo.", ctx)
    assert decision.selected_bots == ["roxstar-ai-dost"]
    assert decision.is_explicit is True

def test_routing_explicit_sathi():
    router = BotRouter()
    ctx = RoomContext()
    decision = router.route("user_1", "AI Sathi, iska example do.", ctx)
    assert decision.selected_bots == ["roxstar-ai-sathi"]
    assert decision.is_explicit is True

def test_routing_explicit_dual_sequential():
    router = BotRouter()
    ctx = RoomContext()
    decision = router.route("user_1", "AI Dost pehle answer karo, AI Sathi baad mein example dena.", ctx)
    assert decision.selected_bots == ["roxstar-ai-dost", "roxstar-ai-sathi"]
    assert decision.is_sequential is True

def test_routing_casual_chatter_silence():
    router = BotRouter()
    ctx = RoomContext()
    decision = router.route("user_1", "Kal cricket match dekha?", ctx)
    assert decision.selected_bots == []
    assert "casual conversation" in decision.reason

def test_routing_followup_continuation():
    router = BotRouter()
    ctx = RoomContext()
    ctx.last_bot = "roxstar-ai-dost"
    decision = router.route("user_2", "Thoda aur simple batao.", ctx)
    assert decision.selected_bots == ["roxstar-ai-dost"]
    assert "follow-up" in decision.reason
