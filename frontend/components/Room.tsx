import React, { useState, useEffect } from 'react';
import { ParticipantInfo, ChatMessage, LatencyMetrics } from '../types';
import { ParticipantsPanel } from './ParticipantsPanel';
import { TranscriptPanel } from './TranscriptPanel';
import { ChatInput } from './ChatInput';
import { ControlBar } from './ControlBar';
import { MetricsOverlay } from './MetricsOverlay';
import { sendChatMessage, fetchRoomState } from '../lib/livekit';

interface RoomProps {
  roomId: string;
  userIdentity: string;
  userName: string;
  onLeave: () => void;
}

export const Room: React.FC<RoomProps> = ({ roomId, userIdentity, userName, onLeave }) => {
  const [participants, setParticipants] = useState<ParticipantInfo[]>([
    { identity: userIdentity, name: userName, role: 'human', isSpeaking: false, isMuted: false, joinedAt: Date.now() },
    { identity: 'roxstar-ai-dost', name: 'Roxstar AI Dost', role: 'bot', isSpeaking: false, isMuted: false, joinedAt: Date.now() },
    { identity: 'roxstar-ai-sathi', name: 'Roxstar AI Sathi', role: 'bot', isSpeaking: false, isMuted: false, joinedAt: Date.now() },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | undefined>(undefined);
  const [connectionState, setConnectionState] = useState('connected');
  const [isSending, setIsSending] = useState(false);

  const [metrics, setMetrics] = useState<LatencyMetrics>({
    stt_ms: 380,
    llm_ms: 650,
    tts_ms: 720,
    total_ms: 1750,
  });

  // Polling room state periodically for live multi-user sync
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const state = await fetchRoomState(roomId);
        if (state.current_speaker) {
          setCurrentSpeaker(state.current_speaker);
        } else {
          setCurrentSpeaker(undefined);
        }

        // Sync full participants roster across all joined users
        if (state.participants) {
          const participantList: ParticipantInfo[] = Object.values(state.participants).map((p: any) => ({
            identity: p.identity,
            name: p.display_name || p.identity,
            role: p.role === 'bot' ? 'bot' : 'human',
            isSpeaking: state.current_speaker === p.identity,
            isMuted: false,
            joinedAt: p.joined_at || Date.now()
          }));
          setParticipants(participantList);
        }

        // Sync shared conversation transcript history
        if (state.conversation_history && state.conversation_history.length > 0) {
          const syncedMessages: ChatMessage[] = state.conversation_history.map((msg: any) => ({
            id: msg.id,
            speakerId: msg.speaker_id,
            speakerName: msg.speaker_name,
            speakerRole: msg.speaker_role === 'bot' ? 'bot' : 'human',
            text: msg.text,
            timestamp: msg.timestamp,
          }));
          setMessages(syncedMessages);
        }
      } catch (err) {
        // Silently handle offline backend polling
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleSendMessage = async (text: string) => {
    setIsSending(true);
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      speakerId: userIdentity,
      speakerName: userName,
      speakerRole: 'human',
      text,
      timestamp: Date.now() / 1000,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await sendChatMessage(roomId, userIdentity, userName, text);
      if (response.responded && response.responses) {
        response.responses.forEach((resp: any) => {
          const botMsg: ChatMessage = {
            id: `bot_msg_${Date.now()}_${resp.bot_id}`,
            speakerId: resp.bot_id,
            speakerName: resp.bot_name,
            speakerRole: 'bot',
            text: resp.text,
            timestamp: Date.now() / 1000,
            metrics: resp.metrics,
          };
          setMessages((prev) => [...prev, botMsg]);

          if (resp.metrics) {
            setMetrics({
              stt_ms: 410,
              llm_ms: resp.metrics.llm_ms || 650,
              tts_ms: resp.metrics.tts_ms || 720,
              total_ms: resp.metrics.total_ms || 1780,
              lastUpdatedBot: resp.bot_name,
            });
          }
        });
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-950 text-slate-100 p-4 gap-4 font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm">
            R
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 tracking-wide">Roxstar AI Voice Room</h1>
            <p className="text-xs text-slate-400">Room ID: <span className="font-mono text-blue-400">{roomId}</span></p>
          </div>
        </div>

        <MetricsOverlay metrics={metrics} connectionState={connectionState} />
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Participants Panel */}
        <div className="md:col-span-4 lg:col-span-3 h-full min-h-0">
          <ParticipantsPanel participants={participants} currentSpeaker={currentSpeaker} />
        </div>

        {/* Right Column: Transcript Panel & Controls */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full gap-4 min-h-0">
          <div className="flex-1 min-h-0">
            <TranscriptPanel messages={messages} />
          </div>

          <div className="shrink-0 space-y-3">
            <ChatInput onSendMessage={handleSendMessage} disabled={isSending} />
            <ControlBar
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              isSpeakerOn={isSpeakerOn}
              onToggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
              onLeaveRoom={onLeave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
