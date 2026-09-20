export interface ParticipantInfo {
  identity: string;
  name: string;
  role: 'human' | 'bot';
  isSpeaking: boolean;
  isMuted: boolean;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: 'human' | 'bot';
  text: string;
  timestamp: number;
  audioBytes?: string;
  metrics?: {
    stt_ms?: number;
    llm_ms?: number;
    tts_ms?: number;
    total_ms?: number;
  };
}

export interface LatencyMetrics {
  stt_ms: number;
  llm_ms: number;
  tts_ms: number;
  total_ms: number;
  lastUpdatedBot?: string;
}
