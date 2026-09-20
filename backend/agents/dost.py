import time
import logging
from typing import Dict, Any, Optional
from backend.agents.prompts import DOST_SYSTEM_PROMPT
from backend.agents.context import RoomContext
from backend.agents.turn_manager import TurnManager, ResponseState
from backend.services.llm import LLMService
from backend.services.tts import TTSService

logger = logging.getLogger("RoxstarAI.Dost")

class DostAgent:
    IDENTITY = "roxstar-ai-dost"
    NAME = "Roxstar AI Dost"
    GENDER = "male"

    def __init__(self, turn_manager: TurnManager, llm_service: Optional[LLMService] = None, tts_service: Optional[TTSService] = None):
        self.turn_manager = turn_manager
        self.llm = llm_service or LLMService()
        self.tts = tts_service or TTSService()

    async def process_turn(
        self,
        speaker_id: str,
        speaker_name: str,
        text: str,
        context: RoomContext
    ) -> Optional[Dict[str, Any]]:
        start_time = time.time()
        
        # 1. Try to acquire speaking lock
        acquired = await self.turn_manager.acquire_lock(self.IDENTITY)
        if not acquired:
            logger.info(f"[{self.IDENTITY}] Lock acquired by another entity or cooling down. Skipping.")
            return None

        try:
            # Get speaker memory summary for isolation
            speaker_memory = context.get_speaker_memory_summary(speaker_id)
            recent_history = [msg.model_dump() for msg in context.conversation_history[-10:]]

            # 2. LLM Generation
            llm_result = await self.llm.generate_response(
                system_prompt=DOST_SYSTEM_PROMPT,
                user_message=f"{speaker_name}: {text}",
                conversation_history=recent_history,
                speaker_memory_summary=speaker_memory
            )
            response_text = llm_result["text"]
            llm_latency = llm_result["latency_ms"]

            await self.turn_manager.update_state(ResponseState.SPEAKING, self.IDENTITY)

            # 3. TTS Synthesis
            tts_result = await self.tts.synthesize(response_text, voice_gender=self.GENDER)
            tts_latency = tts_result["latency_ms"]

            total_latency = int((time.time() - start_time) * 1000)

            # Structured logging telemetry
            logger.info(
                f"[VOICE REQUEST] Speaker: {speaker_name} | Input: '{text}' | Selected Bot: {self.NAME} | "
                f"STT: --ms | LLM: {llm_latency}ms | TTS: {tts_latency}ms | Total: {total_latency / 1000:.2f}s"
            )

            # 4. Update Context
            context.add_message(
                speaker_id=self.IDENTITY,
                speaker_name=self.NAME,
                speaker_role="bot",
                text=response_text
            )

            return {
                "bot_id": self.IDENTITY,
                "bot_name": self.NAME,
                "text": response_text,
                "audio_bytes": tts_result["audio_bytes"],
                "metrics": {
                    "llm_ms": llm_latency,
                    "tts_ms": tts_latency,
                    "total_ms": total_latency
                }
            }
        except Exception as e:
            logger.error(f"[{self.IDENTITY}] Error during turn processing: {e}")
            return None
        finally:
            await self.turn_manager.release_lock(self.IDENTITY)
