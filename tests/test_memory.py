import pytest
from backend.agents.context import RoomContext

def test_speaker_memory_isolation():
    ctx = RoomContext(room_id="test-room-mem")
    ctx.add_participant("user_rahul", "Rahul", role="human")
    ctx.add_participant("user_priya", "Priya", role="human")

    # Rahul tells info
    ctx.add_message("user_rahul", "Rahul", "human", "Mera naam Rahul hai aur mujhe cricket pasand hai.")
    
    # Priya tells info
    ctx.add_message("user_priya", "Priya", "human", "Mera naam Priya hai aur mujhe music pasand hai.")

    rahul_mem = ctx.get_speaker_memory_summary("user_rahul")
    priya_mem = ctx.get_speaker_memory_summary("user_priya")

    # Verify isolation
    assert "Rahul" in rahul_mem
    assert "cricket" in rahul_mem
    assert "Priya" not in rahul_mem

    assert "Priya" in priya_mem
    assert "music" in priya_mem
    assert "Rahul" not in priya_mem
