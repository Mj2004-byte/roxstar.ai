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
    <div className="bg-[#140d28]/90 backdrop-blur-md border border-[#2d1b50] rounded-2xl p-4 flex flex-col h-full shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-[#281848] mb-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span>Live Conversation</span>
        </h2>
        <div className="flex items-center gap-2 text-[11px] text-pink-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Sync</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2 py-8">
            <Bot className="w-7 h-7 text-pink-500/40" />
            <p className="text-slate-400 font-medium">Room conversation is empty.</p>
            <p className="text-[11px] text-slate-500">Speak into your mic or type a message below to start!</p>
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
                      ? 'bg-[#1e133d] border-indigo-500/30 text-slate-100'
                      : 'bg-[#24123c] border-pink-500/30 text-slate-100'
                    : 'bg-[#180f30] border-[#29174d] text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm ${
                    isBot
                      ? isDost
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white'
                      : 'bg-[#2a174f] text-pink-300 border border-pink-500/30'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">{msg.speakerName}</span>
                      {isBot && (
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                            isDost
                              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              : 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                          }`}
                        >
                          {isDost ? 'Dost · Male AI' : 'Sathi · Female AI'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" /> {formattedTime}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-200 leading-relaxed font-sans">{msg.text}</p>

                  {msg.metrics && (
                    <div className="mt-2 pt-2 border-t border-purple-900/30 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-pink-400 font-medium">
                        <Zap className="w-3 h-3" /> Telemetry:
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
