import React from 'react';
import { ParticipantInfo } from '../types';
import { User, Bot, Volume2, MicOff, Mic } from 'lucide-react';

interface ParticipantsPanelProps {
  participants: ParticipantInfo[];
  currentSpeaker?: string;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ participants, currentSpeaker }) => {
  return (
    <div className="bg-[#140d28]/90 backdrop-blur-md border border-[#2d1b50] rounded-2xl p-4 flex flex-col h-full shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-[#281848] mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-200">Room Participants</h2>
        </div>
        <span className="bg-[#2a174d] text-pink-300 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border border-pink-500/20">
          {participants.length} Active
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {participants.map((p) => {
          const isBot = p.role === 'bot' || p.identity.startsWith('roxstar-ai');
          const isDost = p.identity.includes('dost');
          const isCurrentlySpeaking = p.isSpeaking || currentSpeaker === p.identity;

          return (
            <div
              key={p.identity}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                isCurrentlySpeaking
                  ? 'bg-[#29144c] border-pink-500/60 shadow-lg shadow-pink-500/10'
                  : 'bg-[#1a1033] border-[#251644] hover:border-[#3b216b]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                    isBot
                      ? isDost
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-700 text-white'
                        : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white'
                      : 'bg-[#28174a] text-pink-300 border border-pink-500/30'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-[13px] truncate">{p.name}</span>
                    {isBot ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30">
                        {isDost ? 'Dost · Male AI' : 'Sathi · Female AI'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Human
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlySpeaking ? 'bg-pink-400 animate-pulse' : 'bg-emerald-400'}`} />
                    {isCurrentlySpeaking ? (
                      <span className="text-pink-400 font-medium text-[11px] flex items-center gap-1">
                        <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Online</span>
                    )}
                  </div>
                </div>
              </div>

              {!isBot && (
                <div className={`p-1.5 rounded-lg ${p.isMuted ? 'text-rose-400 bg-rose-500/10' : 'text-pink-400 bg-pink-500/10'}`}>
                  {p.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
