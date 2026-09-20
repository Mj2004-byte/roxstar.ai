import React from 'react';
import { ParticipantInfo } from '../types';
import { User, Bot, Volume2, MicOff, Mic } from 'lucide-react';

interface ParticipantsPanelProps {
  participants: ParticipantInfo[];
  currentSpeaker?: string;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ participants, currentSpeaker }) => {
  return (
    <div className="bg-[#160d2b]/80 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-pink-500/20 mb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Participants</span>
          <span className="bg-pink-500/20 text-pink-300 text-xs px-2.5 py-0.5 rounded-full font-mono">
            {participants.length} Active
          </span>
        </h2>
      </div>

      <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
        {participants.map((p) => {
          const isBot = p.role === 'bot' || p.identity.startsWith('roxstar-ai');
          const isCurrentlySpeaking = p.isSpeaking || currentSpeaker === p.identity;

          return (
            <div
              key={p.identity}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                isCurrentlySpeaking
                  ? 'bg-pink-950/40 border-pink-500/60 shadow-lg shadow-pink-600/20'
                  : 'bg-[#1c1236]/70 border-purple-900/40 hover:border-pink-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                    isBot
                      ? p.identity.includes('dost')
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white'
                      : 'bg-slate-800 text-pink-300 border border-pink-500/30'
                  }`}
                >
                  {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">{p.name}</span>
                    {isBot && (
                      <span className="bg-pink-500/20 text-pink-300 text-[10px] px-1.5 py-0.2 rounded uppercase font-bold tracking-wider border border-pink-500/30">
                        AI BOT
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlySpeaking ? 'bg-pink-400 animate-ping' : 'bg-emerald-400'}`} />
                    {isCurrentlySpeaking ? (
                      <span className="text-pink-400 font-medium flex items-center gap-1">
                        <Volume2 className="w-3 h-3 animate-pulse" /> Speaking...
                      </span>
                    ) : (
                      'Online'
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isBot && (
                  <button className={`p-1.5 rounded-lg ${p.isMuted ? 'text-rose-400 bg-rose-500/10' : 'text-pink-400 bg-pink-500/10'}`}>
                    {p.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
