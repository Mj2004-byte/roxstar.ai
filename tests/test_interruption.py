import pytest
import asyncio
from backend.agents.turn_manager import TurnManager, ResponseState

@pytest.mark.asyncio
async def test_turn_manager_lock_and_interruption():
    tm = TurnManager()
    
    # 1. Acquire lock for Dost
    acquired = await tm.acquire_lock("roxstar-ai-dost")
    assert acquired is True
    assert tm.state == ResponseState.THINKING

    await tm.update_state(ResponseState.SPEAKING, "roxstar-ai-dost")

    # Track callback execution
    canceled = False
    def cancel_cb():
        nonlocal canceled
        canceled = True

    tm.register_cancel_callback(cancel_cb)

    # 2. Simulate user interruption
    interrupted = await tm.handle_interruption("user_rahul")
    assert interrupted is True
    assert canceled is True
    assert tm.state == ResponseState.IDLE
    assert tm.current_speaker is None
