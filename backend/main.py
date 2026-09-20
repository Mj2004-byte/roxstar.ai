import logging
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import settings
from backend.agents.context import RoomContext
from backend.agents.turn_manager import TurnManager
from backend.agents.router import BotRouter
from backend.agents.dost import DostAgent
from backend.agents.sathi import SathiAgent
from backend.services.livekit_service import LiveKitService

# Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("RoxstarAI.Main")

app = FastAPI(
    title="Roxstar AI Voice Room Assistant API",
    version="1.0.0",
    description="Real-time voice AI room assistant backend with LiveKit multi-bot orchestration"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Session Stores
room_contexts: Dict[str, RoomContext] = {}
turn_managers: Dict[str, TurnManager] = {}
bot_routers: Dict[str, BotRouter] = {}

livekit_service = LiveKitService()

def get_or_create_room_components(room_id: str):
    if room_id not in room_contexts:
        context = RoomContext(room_id=room_id)
        # Add default AI bots to participants
        context.add_participant("roxstar-ai-dost", "Roxstar AI Dost", role="bot")
        context.add_participant("roxstar-ai-sathi", "Roxstar AI Sathi", role="bot")
        
        room_contexts[room_id] = context
        turn_managers[room_id] = TurnManager()
        bot_routers[room_id] = BotRouter()

    return room_contexts[room_id], turn_managers[room_id], bot_routers[room_id]

# Data Transfer Objects
class TokenRequest(BaseModel):
    room_name: str
    participant_identity: str
    participant_name: Optional[str] = None
    is_agent: bool = False
    fresh_session: bool = True

class ChatRequest(BaseModel):
    room_id: str
    speaker_id: str
    speaker_name: str
    text: str

class InterruptionRequest(BaseModel):
    room_id: str
    speaker_id: str

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Roxstar AI Voice Room Assistant API",
        "livekit_url": settings.LIVEKIT_URL,
        "stt_provider": settings.STT_PROVIDER,
        "tts_provider": settings.TTS_PROVIDER,
        "llm_model": settings.LLM_MODEL
    }

@app.post("/api/token")
async def get_token(req: TokenRequest):
    try:
        token = livekit_service.generate_token(
            room_name=req.room_name,
            participant_identity=req.participant_identity,
            participant_name=req.participant_name,
            is_agent=req.is_agent
        )
        
        # Ensure room context is initialized
        context, _, _ = get_or_create_room_components(req.room_name)
        if req.fresh_session and not req.is_agent:
            context.reset_conversation()

        if not req.is_agent:
            context.add_participant(req.participant_identity, req.participant_name or req.participant_identity)

        return {
            "token": token,
            "url": settings.LIVEKIT_URL,
            "room_name": req.room_name,
            "participant_identity": req.participant_identity
        }
    except Exception as e:
        logger.error(f"Error generating token: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/room/{room_id}/reset")
async def reset_room(room_id: str):
    """Resets chat history for a fresh room session."""
    context, turn_mgr, _ = get_or_create_room_components(room_id)
    context.reset_conversation()
    await turn_mgr.update_state("IDLE", None)
    logger.info(f"Room {room_id} conversation reset for fresh session.")
    return {"status": "success", "room_id": room_id}

@app.post("/api/chat")
async def process_chat(req: ChatRequest):
    """Processes user text chat or transcribed voice turn through BotRouter & Agents."""
    context, turn_mgr, router = get_or_create_room_components(req.room_id)

    # Check for barge-in / interruption if bot is currently speaking
    if turn_mgr.state in ["THINKING", "SPEAKING"]:
        interrupted = await turn_mgr.handle_interruption(req.speaker_id)
        if interrupted:
            logger.info(f"User {req.speaker_name} interrupted active bot speech.")

    # Record user message turn in shared context
    context.add_message(
        speaker_id=req.speaker_id,
        speaker_name=req.speaker_name,
        speaker_role="human",
        text=req.text
    )

    # Route request
    decision = router.route(req.speaker_id, req.text, context)
    logger.info(f"Routing Decision: {decision.model_dump()}")

    if not decision.selected_bots:
        return {
            "responded": False,
            "reason": decision.reason,
            "responses": []
        }

    responses = []
    dost_agent = DostAgent(turn_manager=turn_mgr)
    sathi_agent = SathiAgent(turn_manager=turn_mgr)

    # Execute selected bot(s)
    for bot_id in decision.selected_bots:
        if bot_id == "roxstar-ai-dost":
            resp = await dost_agent.process_turn(req.speaker_id, req.speaker_name, req.text, context)
            if resp:
                responses.append(resp)
        elif bot_id == "roxstar-ai-sathi":
            resp = await sathi_agent.process_turn(req.speaker_id, req.speaker_name, req.text, context)
            if resp:
                responses.append(resp)

    return {
        "responded": len(responses) > 0,
        "reason": decision.reason,
        "responses": responses
    }

@app.post("/api/interrupt")
async def trigger_interruption(req: InterruptionRequest):
    _, turn_mgr, _ = get_or_create_room_components(req.room_id)
    interrupted = await turn_mgr.handle_interruption(req.speaker_id)
    return {"interrupted": interrupted, "current_state": turn_mgr.state}

@app.get("/api/room/{room_id}")
async def get_room_details(room_id: str):
    context, turn_mgr, _ = get_or_create_room_components(room_id)
    state = context.to_dict()
    state["turn_state"] = turn_mgr.state
    state["current_speaker"] = turn_mgr.current_speaker
    return state

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
