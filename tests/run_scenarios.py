import sys
import os
import asyncio

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.agents.context import RoomContext
from backend.agents.turn_manager import TurnManager
from backend.agents.router import BotRouter
from backend.agents.dost import DostAgent
from backend.agents.sathi import SathiAgent

async def run_all_scenarios():
    print("=" * 70)
    print("  ROXSTAR AI VOICE ROOM ASSISTANT - 7 MANDATORY DEMO SCENARIOS TEST")
    print("=" * 70)

    context = RoomContext(room_id="scenario-test-room")
    context.add_participant("user_rahul", "Rahul", role="human")
    context.add_participant("user_priya", "Priya", role="human")

    turn_mgr = TurnManager()
    router = BotRouter()
    dost = DostAgent(turn_manager=turn_mgr)
    sathi = SathiAgent(turn_manager=turn_mgr)

    async def execute_turn(speaker_id: str, speaker_name: str, text: str):
        print(f"\n[USER {speaker_name}]: '{text}'")
        
        # Check barge-in
        if turn_mgr.state in ["THINKING", "SPEAKING"]:
            interrupted = await turn_mgr.handle_interruption(speaker_id)
            if interrupted:
                print("   [BARGE-IN TRIGGERED]: Bot speech cancelled!")

        context.add_message(speaker_id, speaker_name, "human", text)
        decision = router.route(speaker_id, text, context)
        print(f"   [ROUTER DECISION]: {decision.reason} | Selected Bots: {decision.selected_bots}")

        if not decision.selected_bots:
            print("   [BOTS SILENT]")
            return

        for bot_id in decision.selected_bots:
            if bot_id == "roxstar-ai-dost":
                res = await dost.process_turn(speaker_id, speaker_name, text, context)
                if res:
                    print(f"   [BOT {res['bot_name']}]: '{res['text']}' (LLM: {res['metrics']['llm_ms']}ms, TTS: {res['metrics']['tts_ms']}ms)")
            elif bot_id == "roxstar-ai-sathi":
                res = await sathi.process_turn(speaker_id, speaker_name, text, context)
                if res:
                    print(f"   [BOT {res['bot_name']}]: '{res['text']}' (LLM: {res['metrics']['llm_ms']}ms, TTS: {res['metrics']['tts_ms']}ms)")

    # --------------------------------------------------
    # SCENARIO 1: Hindi/Hinglish Query
    # --------------------------------------------------
    print("\n--- SCENARIO 1: Hindi/Hinglish Input ---")
    await execute_turn("user_rahul", "Rahul", "AI kya hota hai?")

    # --------------------------------------------------
    # SCENARIO 2: English Query expecting Hinglish Answer
    # --------------------------------------------------
    print("\n--- SCENARIO 2: English Query ---")
    await execute_turn("user_rahul", "Rahul", "Can you explain cloud computing?")

    # --------------------------------------------------
    # SCENARIO 3: Pronoun Context Resolution ("unki movie")
    # --------------------------------------------------
    print("\n--- SCENARIO 3: Pronoun Context Resolution ---")
    await execute_turn("user_rahul", "Rahul", "Shah Rukh Khan ke baare mein batao.")
    await execute_turn("user_rahul", "Rahul", "Unki koi famous movie batao.")

    # --------------------------------------------------
    # SCENARIO 4: Multi-User Topic Follow-up (Rahul -> Priya)
    # --------------------------------------------------
    print("\n--- SCENARIO 4: Multi-User Topic Continuity ---")
    await execute_turn("user_rahul", "Rahul", "AI kya hota hai?")
    await execute_turn("user_priya", "Priya", "Thoda aur simple batao.")

    # --------------------------------------------------
    # SCENARIO 5: Speaker Memory Recall (Rahul facts isolated from Priya)
    # --------------------------------------------------
    print("\n--- SCENARIO 5: Speaker-Specific Memory Recall ---")
    await execute_turn("user_rahul", "Rahul", "Mera naam Rahul hai aur mujhe cricket pasand hai.")
    await execute_turn("user_priya", "Priya", "Mera naam Priya hai aur mujhe badminton pasand hai.")
    await execute_turn("user_rahul", "Rahul", "Maine apne baare mein kya bataya tha?")

    # --------------------------------------------------
    # SCENARIO 6: Interruption / Barge-in
    # --------------------------------------------------
    print("\n--- SCENARIO 6: Interruption / Barge-In ---")
    # Simulate bot speaking state
    await turn_mgr.acquire_lock("roxstar-ai-dost")
    await turn_mgr.update_state("SPEAKING", "roxstar-ai-dost")
    print("   [BOT IS CURRENTLY SPEAKING]: 'Machine learning mein pehle data...'")
    await execute_turn("user_rahul", "Rahul", "Ruko, simple example se samjhao.")

    # --------------------------------------------------
    # SCENARIO 7: Dual-Bot Sequential Response
    # --------------------------------------------------
    print("\n--- SCENARIO 7: Dual-Bot Sequential Response ---")
    await execute_turn("user_rahul", "Rahul", "AI Dost pehle answer karo, AI Sathi baad mein example dena.")

    print("\n" + "=" * 70)
    print("  ALL 7 DEMO SCENARIOS EXECUTED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_all_scenarios())
