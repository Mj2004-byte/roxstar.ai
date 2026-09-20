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
    <div className="bg-[#160d2b]/80 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-pink-500/20 mb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Conversation & Transcript</span>
        </h2>
        <span className="text-xs text-pink-300 font-mono">Live Sync</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-pink-300/50 text-sm space-y-2">
            <Bot className="w-8 h-8 text-pink-500/40" />
            <p>No messages yet. Speak or send a message to start!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isBot = msg.speakerRole === 'bot' || msg.speakerId.startsWith('roxstar-ai');
            const isDost = msg.speakerId.includes('dost');
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
                    ? isDost
                      ? 'bg-purple-950/40 border-purple-500/30 text-slate-100'
                      : 'bg-pink-950/40 border-pink-500/30 text-slate-100'
                    : 'bg-[#1a1130]/90 border-slate-800 text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-md ${
                    isBot
                      ? isDost
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white'
                      : 'bg-slate-800 text-pink-300 border border-pink-500/30'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{msg.speakerName}</span>
                      {isBot && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            isDost
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                          }`}
                        >
                          {isDost ? 'Male Persona' : 'Female Persona'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-pink-300/60 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {formattedTime}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-sans">{msg.text}</p>

                  {msg.metrics && (
                    <div className="mt-2 pt-2 border-t border-purple-900/40 flex items-center gap-3 text-[11px] text-pink-300/70 font-mono">
                      <span className="flex items-center gap-1 text-pink-400 font-medium">
                        <Zap className="w-3 h-3" /> Latency:
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
