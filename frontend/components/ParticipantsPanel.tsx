import React from 'react';
import { ParticipantInfo } from '../types';
import { User, Bot, Mic, MicOff, Volume2 } from 'lucide-react';

interface ParticipantsPanelProps {
  participants: ParticipantInfo[];
  currentSpeaker?: string;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ participants, currentSpeaker }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span>Participants</span>
          <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-mono">
            {participants.length} Active
          </span>
        </h2>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {participants.map((p) => {
          const isBot = p.role === 'bot' || p.identity.startsWith('roxstar-ai');
          const isCurrentlySpeaking = p.isSpeaking || currentSpeaker === p.identity;

          return (
            <div
              key={p.identity}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isCurrentlySpeaking
                  ? 'bg-blue-950/40 border-blue-500/50 shadow-sm shadow-blue-500/20'
                  : 'bg-slate-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    isBot
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200 text-sm">{p.name}</span>
                    {isBot && (
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded uppercase font-semibold">
                        AI Bot
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlySpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    {isCurrentlySpeaking ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
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
                  <button className={`p-1.5 rounded-md ${p.isMuted ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-800'}`}>
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
