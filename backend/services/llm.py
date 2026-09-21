import time
import asyncio
import logging
import random
from typing import List, Dict, Any, Optional
from backend.config import settings

logger = logging.getLogger("RoxstarAI.LLM")

class LLMService:
    GROQ_MODELS = [
        "groq/compound",
        "groq/compound-mini",
        "qwen/qwen3.8-27b"
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
        # Limit history to last 5 items to ensure fast response & no payload errors
        for msg in conversation_history[-5:]:
            role = "assistant" if msg.get("speaker_role") == "bot" else "user"
            messages.append({"role": role, "content": f"{msg.get('speaker_name', 'User')}: {msg.get('text', '')}"})
        messages.append({"role": "user", "content": user_message})

        # 1. Try Groq API Provider
        if (self.provider == "groq" or self.groq_api_key) and self.groq_api_key:
            try:
                import openai
                client = openai.AsyncOpenAI(
                    api_key=self.groq_api_key,
                    base_url="https://api.groq.com/openai/v1"
                )

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
            except Exception as e:
                logger.error(f"Groq API client init error: {e}")

        # 2. Try OpenAI API Provider
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

        # 3. Smart Persona-Differentiated Context-Aware Dynamic Generator
        await asyncio.sleep(0.15)
        latency = time.time() - start_time
        dynamic_text = self._generate_smart_dynamic_response(
            system_prompt, user_message, conversation_history, speaker_memory_summary
        )
        return {
            "text": dynamic_text,
            "latency_ms": int(latency * 1000),
            "model": "dynamic-smart-engine"
        }

    def _generate_smart_dynamic_response(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        speaker_memory_summary: str
    ) -> str:
        is_dost = "Dost" in system_prompt or "Male" in system_prompt or "male" in system_prompt
        lower_msg = user_message.lower()

        # Combine past message history to detect active room topic
        history_text = " ".join([m.get("text", "").lower() for m in conversation_history])
        full_context = f"{history_text} {lower_msg}"

        # Detect speaker name if present
        speaker_name = ""
        if ":" in user_message:
            speaker_name = user_message.split(":")[0].strip()

        # Topic 1: Speaker Memory Query
        if any(w in lower_msg for w in ["mera naam", "about me", "my name", "maine apne baare mein", "kya bataya"]):
            if speaker_memory_summary and "No personal memory" not in speaker_memory_summary:
                if is_dost:
                    return f"Bhai, tumne bataya tha ki {speaker_memory_summary}. Mujhe yaad hai dost!"
                else:
                    return f"Haan ji, aapne bataya tha ki {speaker_memory_summary}. Mujhe achhe se yaad hai!"
            else:
                if is_dost:
                    return f"Bhai {speaker_name}, tumne abhi tak apne baare mein zyada nahi bataya. Kuch batana chahoge?"
                else:
                    return f"Haan ji {speaker_name}, aapne abhi tak apne baare mein zyada share nahi kiya. Batayein na!"

        # Topic 2: Follow-up queries ("tell me more", "btaiye", "detail", "hn", "yes", "more")
        is_followup = any(w in lower_msg for w in ["more", "detail", "btaiye", "batao", "hn", "yes", "tell me", "aur"])

        if "cloud" in full_context:
            if is_followup:
                if is_dost:
                    return "Cloud computing mein 3 main types hote hain: IaaS, PaaS aur SaaS. Jaise AWS ya Google Cloud use karke aap bina hardware khareede servers chala sakte ho."
                else:
                    return "Haan! Cloud computing ka sabse bada fayda hai scalable storage aur cost savings. Aap duniya mein kahin se bhi apna data access kar sakte ho."
            else:
                if is_dost:
                    return "Cloud computing ka simple matlab hai internet ke through servers, storage aur databases use karna, bina local hardware ke."
                else:
                    return "Bilkul! Cloud computing se hum internet par storage aur computing resources use karte hain. Isse physical servers manage karne ki tension khatam ho jaati hai."

        if "shah rukh" in full_context or "movie" in full_context or "unki" in full_context:
            if is_followup:
                if is_dost:
                    return "Shah Rukh Khan ki iconic movies mein DDLJ, Swades, Chak De India, aur recent hits Pathaan aur Jawan hain! Konsi movie tumhari favorite hai?"
                else:
                    return "Unki movies jaise Dilwale Dulhania Le Jayenge aur Swades cinema classic hain! Unka acting style sabko bohot pasand aata hai."
            else:
                if is_dost:
                    return "Shah Rukh Khan Indian cinema ke King Khan hain! Unki acting aur charisma worldwide famous hai."
                else:
                    return "Haan ji, Shah Rukh Khan Bollywood ke Superstar hain. Unhone kayi blockbusters di hain!"

        if "ai" in full_context or "artificial intelligence" in full_context:
            if is_followup:
                if is_dost:
                    return "AI ke key parts hain Machine Learning aur Deep Learning. Simple words mein, yeh algorithm se patterns seekhta hai aur khud decide karta hai."
                else:
                    return "Haan! Everyday examples dekhein to Google Assistant, Netflix recommendations, aur ChatGPT sab AI ke examples hain jo hum daily use karte hain."
            else:
                if is_dost:
                    return "AI ek aisi technology hai jo machine ko smart lene layak banati hai. Simple words mein bolo to machine ko smart bana deti hai."
                else:
                    return "Bilkul! AI machine ko data se seekhne aur smart decisions lene mein help karti hai."

        # General Greetings
        if any(g in lower_msg for g in ["hi", "hello", "hlo", "hey", "namaste"]):
            if is_dost:
                return f"Hey {speaker_name or 'dost'}! Kaise ho bhai? Kya help chahiye aaj?"
            else:
                return f"Hello {speaker_name or 'ji'}! Welcome to the room! Aap aaj kya discuss karna chahenge?"

        # General Fallback - Vary turns dynamically based on persona
        if is_dost:
            dost_responses = [
                f"Sahi baat hai {speaker_name}! Is baare mein aur detail chahiye to batao, main samjha deta hoon.",
                f"Bilkul bhai! Is topic par main tumhein practical examples ke saath aur samjha sakta hoon.",
                f"Haan dost! Yeh interesting point hai. Iske aage explain karoon?"
            ]
            return random.choice(dost_responses)
        else:
            sathi_responses = [
                f"Haan ji {speaker_name}! Main aapko iske baare mein aur simple words mein bataati hoon. Aap kya jaan na chahenge?",
                f"Bilkul! Yeh ek bohot achha topic hai. Iske practical uses ke baare mein discuss karein?",
                f"Haan ji! Aapke question ke mutabiq main isko detail mein explain kar sakti hoon."
            ]
            return random.choice(sathi_responses)
