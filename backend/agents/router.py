import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from backend.agents.context import RoomContext

class RouteDecision(BaseModel):
    selected_bots: List[str] # List of bot identities e.g. ["roxstar-ai-dost"], or sequential ["roxstar-ai-dost", "roxstar-ai-sathi"], or []
    is_explicit: bool
    is_sequential: bool
    reason: str
    target_topic: Optional[str] = None

class BotRouter:
    BOT_DOST_ID = "roxstar-ai-dost"
    BOT_SATHI_ID = "roxstar-ai-sathi"

    # AI and tech relevance keywords
    RELEVANCE_KEYWORDS = [
        "ai", "artificial intelligence", "technology", "tech", "cloud", "computing", "server",
        "machine learning", "ml", "python", "code", "programming", "software", "network",
        "system", "batao", "samjhao", "kaise", "kya", "example", "help", "who", "what", "how",
        "meaning", "matlab", "shukriya", "thanks", "hello", "hi", "namaste", "pehle", "baad",
        "discuss", "summary", "abhi tak", "kya baat", "revision"
    ]

    # Non-AI casual chatter triggers that bots should ignore unless addressed
    CASUAL_CHATTER_TRIGGERS = [
        "cricket", "match", "kal", "movie", "khana", "khaya", "kaha ho", "kya kar rahe ho rahul",
        "priya tum", "chai", "coffee", "weather", "mausam"
    ]

    def __init__(self):
        self._last_selected_bot = self.BOT_DOST_ID

    def route(self, speaker_id: str, text: str, context: RoomContext) -> RouteDecision:
        lower_text = text.lower().strip()

        # Rule 1: Check for explicit dual / sequential request
        # e.g., "AI Dost pehle answer karo, AI Sathi example dena"
        has_dost_mention = "dost" in lower_text or "ai dost" in lower_text
        has_sathi_mention = "sathi" in lower_text or "ai sathi" in lower_text

        if has_dost_mention and has_sathi_mention:
            if "pehle" in lower_text and ("baad" in lower_text or "example" in lower_text):
                if lower_text.find("dost") < lower_text.find("sathi"):
                    return RouteDecision(
                        selected_bots=[self.BOT_DOST_ID, self.BOT_SATHI_ID],
                        is_explicit=True,
                        is_sequential=True,
                        reason="Explicit sequential request: Dost first, Sathi second"
                    )
                else:
                    return RouteDecision(
                        selected_bots=[self.BOT_SATHI_ID, self.BOT_DOST_ID],
                        is_explicit=True,
                        is_sequential=True,
                        reason="Explicit sequential request: Sathi first, Dost second"
                    )
            return RouteDecision(
                selected_bots=[self.BOT_DOST_ID, self.BOT_SATHI_ID],
                is_explicit=True,
                is_sequential=True,
                reason="Both bots addressed"
            )

        # Rule 2: Explicit single bot addressing
        if has_dost_mention:
            self._last_selected_bot = self.BOT_DOST_ID
            return RouteDecision(
                selected_bots=[self.BOT_DOST_ID],
                is_explicit=True,
                is_sequential=False,
                reason="Explicitly addressed AI Dost"
            )

        if has_sathi_mention:
            self._last_selected_bot = self.BOT_SATHI_ID
            return RouteDecision(
                selected_bots=[self.BOT_SATHI_ID],
                is_explicit=True,
                is_sequential=False,
                reason="Explicitly addressed AI Sathi"
            )

        # Rule 3: Check greetings
        GREETING_KEYWORDS = ["hi", "hello", "hlo", "hey", "namaste", "ssup", "kaise ho", "kya haal hai"]
        is_greeting = any(g == lower_text or lower_text.startswith(g + " ") or lower_text.endswith(" " + g) for g in GREETING_KEYWORDS)

        if is_greeting:
            next_bot = self.BOT_SATHI_ID if self._last_selected_bot == self.BOT_DOST_ID else self.BOT_DOST_ID
            self._last_selected_bot = next_bot
            return RouteDecision(
                selected_bots=[next_bot],
                is_explicit=False,
                is_sequential=False,
                reason="Room greeting - auto-routed to active bot"
            )

        # Rule 4: Check relevance (Filter out human-to-human casual chat)
        # e.g., "Kal cricket match dekha?" -> bots should remain silent
        is_casual = any(trigger in lower_text for trigger in self.CASUAL_CHATTER_TRIGGERS)
        is_relevant = any(kw in lower_text for kw in self.RELEVANCE_KEYWORDS)

        # Exception to casual check: if user asks about themselves (speaker memory recall)
        is_memory_query = any(phrase in lower_text for phrase in [
            "mera naam", "maine apne baare mein", "what did i tell you", "about me", "my name"
        ])

        if is_casual and not is_relevant and not is_memory_query:
            return RouteDecision(
                selected_bots=[],
                is_explicit=False,
                is_sequential=False,
                reason="Human-to-human casual conversation - remaining silent"
            )

        # Rule 4: Check if follow-up to active topic
        # e.g., "Thoda simple batao", "Unki movie", "Example do"
        is_followup = any(kw in lower_text for kw in [
            "thoda", "simple", "aur", "dobara", "phir", "unki", "uske", "example", "explain", "more"
        ])

        if is_followup and context.last_bot:
            return RouteDecision(
                selected_bots=[context.last_bot],
                is_explicit=False,
                is_sequential=False,
                reason=f"Topic follow-up continuing with previous active bot: {context.last_bot}"
            )

        # Rule 5: Default relevance-based routing (Alternate between Dost and Sathi)
        if is_relevant or is_memory_query:
            # Alternate bots for balanced room participation
            next_bot = self.BOT_SATHI_ID if self._last_selected_bot == self.BOT_DOST_ID else self.BOT_DOST_ID
            self._last_selected_bot = next_bot
            return RouteDecision(
                selected_bots=[next_bot],
                is_explicit=False,
                is_sequential=False,
                reason="Relevant AI query - auto-routed to balanced bot persona"
            )

        # Fallback: Remain silent if no rules matched
        return RouteDecision(
            selected_bots=[],
            is_explicit=False,
            is_sequential=False,
            reason="Uncertain intent - remaining silent"
        )
