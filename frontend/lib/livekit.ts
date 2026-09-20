const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL !== undefined 
  ? process.env.NEXT_PUBLIC_BACKEND_URL 
  : '';

export async function fetchRoomToken(roomName: string, identity: string, name?: string) {
  const response = await fetch(`${BACKEND_URL}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room_name: roomName,
      participant_identity: identity,
      participant_name: name || identity,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch token: ${response.statusText}`);
  }

  return response.json();
}

export async function sendChatMessage(roomId: string, speakerId: string, speakerName: string, text: string) {
  const response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room_id: roomId,
      speaker_id: speakerId,
      speaker_name: speakerName,
      text: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to process message: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchRoomState(roomId: string) {
  const response = await fetch(`${BACKEND_URL}/api/room/${roomId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch room state: ${response.statusText}`);
  }
  return response.json();
}
