import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Bot, User, Clock, Zap } from 'lucide-react';

interface TranscriptPanelProps {
  messages: ChatMessage[];
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span>Conversation & Transcript</span>
        </h2>
        <span className="text-xs text-slate-400 font-mono">Live Sync</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
            No messages yet. Speak or send a message to start the room conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isBot = msg.speakerRole === 'bot' || msg.speakerId.startsWith('roxstar-ai');
            const formattedTime = new Date(msg.timestamp * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`flex gap-3 p-3.5 rounded-xl border transition-all ${
                  isBot
                    ? 'bg-slate-850 border-indigo-500/20 text-slate-100'
                    : 'bg-slate-950/60 border-slate-800 text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isBot
                      ? msg.speakerId.includes('dost')
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-200">{msg.speakerName}</span>
                      {isBot && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            msg.speakerId.includes('dost')
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {msg.speakerId.includes('dost') ? 'Male Persona' : 'Female Persona'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {formattedTime}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{msg.text}</p>

                  {msg.metrics && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <Zap className="w-3 h-3" /> Latency Telemetry:
                      </span>
                      {msg.metrics.llm_ms && <span>LLM: {msg.metrics.llm_ms}ms</span>}
                      {msg.metrics.tts_ms && <span>TTS: {msg.metrics.tts_ms}ms</span>}
                      {msg.metrics.total_ms && (
                        <span className="font-bold text-emerald-400">
                          Total: {(msg.metrics.total_ms / 1000).toFixed(2)}s
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
