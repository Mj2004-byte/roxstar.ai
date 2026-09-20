import time
import jwt
from typing import Dict, Any, Optional
from backend.config import settings

class LiveKitService:
    def __init__(self):
        self.url = settings.LIVEKIT_URL
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET

    def generate_token(self, room_name: str, participant_identity: str, participant_name: Optional[str] = None, is_agent: bool = False) -> str:
        """Generate a valid LiveKit AccessToken JWT."""
        try:
            from livekit import api
            grant = api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True
            )
            token = api.AccessToken(self.api_key, self.api_secret) \
                .with_identity(participant_identity) \
                .with_name(participant_name or participant_identity) \
                .with_grants(grant)
            
            if is_agent:
                token.with_metadata("ai_agent")

            return token.to_jwt()
        except ImportError:
            # Standalone JWT fallback if livekit-api is compiling / fallback
            now = int(time.time())
            claims = {
                "exp": now + 86400,
                "iss": self.api_key,
                "sub": participant_identity,
                "name": participant_name or participant_identity,
                "video": {
                    "room": room_name,
                    "roomJoin": True,
                    "canPublish": True,
                    "canSubscribe": True,
                    "canPublishData": True
                }
            }
            return jwt.encode(claims, self.api_secret, algorithm="HS256")
