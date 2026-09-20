import React, { useState, useEffect } from 'react';
import { ParticipantInfo, ChatMessage, LatencyMetrics } from '../types';
import { ParticipantsPanel } from './ParticipantsPanel';
import { TranscriptPanel } from './TranscriptPanel';
import { ChatInput } from './ChatInput';
import { ControlBar } from './ControlBar';
import { MetricsOverlay } from './MetricsOverlay';
import { AudioVisualizer } from './AudioVisualizer';
import { Logo } from './Logo';
import { sendChatMessage, fetchRoomState, resetRoomState } from '../lib/livekit';

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
  const [currentSpeakerName, setCurrentSpeakerName] = useState<string | undefined>(undefined);
  const [connectionState, setConnectionState] = useState('connected');
  const [isSending, setIsSending] = useState(false);

  const [metrics, setMetrics] = useState<LatencyMetrics>({
    stt_ms: 380,
    llm_ms: 300,
    tts_ms: 155,
    total_ms: 835,
  });

  // Polling room state periodically for live multi-user sync
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const state = await fetchRoomState(roomId);
        if (state.current_speaker) {
          setCurrentSpeaker(state.current_speaker);
          const activeParticipant = state.participants?.[state.current_speaker];
          setCurrentSpeakerName(activeParticipant?.display_name || state.current_speaker);
        } else {
          setCurrentSpeaker(undefined);
          setCurrentSpeakerName(undefined);
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
              stt_ms: 380,
              llm_ms: resp.metrics.llm_ms || 300,
              tts_ms: resp.metrics.tts_ms || 155,
              total_ms: resp.metrics.total_ms || 835,
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

  const handleLeaveRoom = async () => {
    try {
      await resetRoomState(roomId);
    } catch (e) {}
    onLeave();
  };

  const handleResetChat = async () => {
    try {
      await resetRoomState(roomId);
      setMessages([]);
    } catch (e) {}
  };

  const humanParticipants = participants.filter((p) => p.role === 'human' || (!p.role && !p.identity.startsWith('roxstar-ai')));
  const humanNames = humanParticipants.map((p) => p.name).join(', ') || userName;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#0e0b16] text-white p-4 gap-4 font-sans overflow-hidden">
      {/* Header Bar with Logo and Prominent Joined Human Participant Names */}
      <header className="flex items-center justify-between bg-[#160d2b]/90 border border-pink-500/20 rounded-2xl px-5 py-3 shadow-xl shrink-0">
        <Logo size="md" />

        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-xs text-pink-200 font-medium">Humans Joined ({humanParticipants.length}):</span>
            <span className="text-sm font-black text-white tracking-wide">{humanNames}</span>
          </div>

          <span className="hidden md:inline text-xs text-pink-300/80 font-mono bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800/40">
            Room: <strong className="text-white">{roomId}</strong>
          </span>

          <button
            onClick={handleResetChat}
            title="Clear Chat & Start Fresh Session"
            className="text-xs text-pink-300 hover:text-white bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 px-3 py-1.5 rounded-xl font-mono font-medium transition-all"
          >
            Clear Session
          </button>
        </div>

        <MetricsOverlay metrics={metrics} connectionState={connectionState} />
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Audio Visualizer Spectrum + Participants Panel */}
        <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
          {/* Equalizer Spectrum Card (Inspired by Image 1) */}
          <AudioVisualizer
            currentSpeakerName={currentSpeakerName}
            isSpeaking={!!currentSpeaker}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
          />
          <div className="flex-1 min-h-0">
            <ParticipantsPanel participants={participants} currentSpeaker={currentSpeaker} />
          </div>
        </div>

        {/* Right Column: Transcript Panel & Chat Input */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col h-full gap-4 min-h-0">
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
              onLeaveRoom={handleLeaveRoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
