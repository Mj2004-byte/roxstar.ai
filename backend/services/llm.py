import time
import asyncio
import logging
from typing import List, Dict, Any, Optional
from backend.config import settings

logger = logging.getLogger("RoxstarAI.LLM")

class LLMService:
    GROQ_MODELS = [
        "groq/compound-mini",
        "groq/compound",
        "qwen/qwen3.8-27b",
        "llama-3.1-8b-instant",
        "llama-3.3-70b-versatile"
    ]

    def __init__(self, provider: Optional[str] = None, model: Optional[str] = None):
        self.provider = provider or settings.LLM_PROVIDER
        self.model = model or settings.LLM_MODEL
        self.groq_api_key = settings.GROQ_API_KEY
        self.openai_api_key = settings.OPENAI_API_KEY

    async def generate_response(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        speaker_memory_summary: str = ""
    ) -> Dict[str, Any]:
        start_time = time.time()

        augmented_system_prompt = system_prompt
        if speaker_memory_summary:
            augmented_system_prompt += f"\n\n[SPEAKER MEMORY CONTEXT]:\n{speaker_memory_summary}"

        messages = [{"role": "system", "content": augmented_system_prompt}]
        for msg in conversation_history:
            role = "assistant" if msg.get("speaker_role") == "bot" else "user"
            messages.append({"role": role, "content": f"{msg.get('speaker_name', 'User')}: {msg.get('text', '')}"})
        messages.append({"role": "user", "content": user_message})

        # 1. Groq API Provider (Ultra-low latency LLM)
        if (self.provider == "groq" or self.groq_api_key) and self.groq_api_key:
            import openai
            client = openai.AsyncOpenAI(
                api_key=self.groq_api_key,
                base_url="https://api.groq.com/openai/v1"
            )

            # Try requested model first, then fallback Groq model list
            candidate_models = [self.model] + [m for m in self.GROQ_MODELS if m != self.model]

            for target_model in candidate_models:
                try:
                    response = await client.chat.completions.create(
                        model=target_model,
                        messages=messages,
                        temperature=0.7,
                        max_tokens=150
                    )
                    text = response.choices[0].message.content.strip()
                    latency = time.time() - start_time
                    logger.info(f"Groq API Response Generated ({target_model}) in {latency*1000:.0f}ms")
                    return {
                        "text": text,
                        "latency_ms": int(latency * 1000),
                        "model": f"groq:{target_model}"
                    }
                except Exception as e:
                    logger.warning(f"Groq model {target_model} failed: {e}. Trying next model...")

        # 2. OpenAI API Provider
        if self.openai_api_key:
            try:
                import openai
                client = openai.AsyncOpenAI(api_key=self.openai_api_key)
                response = await client.chat.completions.create(
                    model=self.model if "gpt" in self.model else "gpt-4o",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=150
                )
                text = response.choices[0].message.content.strip()
                latency = time.time() - start_time
                return {
                    "text": text,
                    "latency_ms": int(latency * 1000),
                    "model": self.model
                }
            except Exception as e:
                logger.error(f"OpenAI API error: {e}. Falling back...")

        # 3. Fallback generator for offline testing
        await asyncio.sleep(0.1)
        latency = time.time() - start_time
        fallback_text = self._get_fallback_response(user_message)
        return {
            "text": fallback_text,
            "latency_ms": int(latency * 1000),
            "model": "fallback-offline"
        }

    def _get_fallback_response(self, text: str) -> str:
        lower = text.lower()
        if "ai kya hota hai" in lower:
            return "AI ek aisi technology hai jo machine ko smart decisions lene mein help karti hai. Simple words mein bolo to machine ko thoda smart bana deti hai."
        if "cloud computing" in lower:
            return "Cloud computing ka simple matlab hai internet ke through servers aur storage use karna, bina local hardware ke."
        if "shah rukh" in lower:
            return "Shah Rukh Khan Indian cinema ke King Khan hain. Unhone DDLJ, Swades aur Jawan jaisi superhit movies di hain."
        if "movie" in lower or "unki" in lower:
            return "Unki sabse famous movies mein Dilwale Dulhania Le Jayenge, Swades, Chak De India aur Pathaan aati hain."
        if "naam" in lower or "mera" in lower or "bataya" in lower:
            return "Tumne bataya tha ki tumhara naam Rahul hai aur tumhe cricket pasand hai!"
        if "simple" in lower or "samjhao" in lower:
            return "Simple words mein bolun to, yeh ek smart assistant jaisa hai jo examples se seekhta hai."
        return "Haan bilkul, main samajh gayi. Iske baare mein aapko aur detail chahiye to batayein!"
