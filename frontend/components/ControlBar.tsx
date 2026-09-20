import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, LogOut } from 'lucide-react';

interface ControlBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isSpeakerOn: boolean;
  onToggleSpeaker: () => void;
  onLeaveRoom: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isMuted,
  onToggleMute,
  isSpeakerOn,
  onToggleSpeaker,
  onLeaveRoom,
}) => {
  return (
    <div className="bg-[#160d2b]/90 border border-pink-500/20 rounded-xl p-3 shadow-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-600/30'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isMuted ? 'Mic Muted' : 'Mic Active'}</span>
        </button>

        <button
          onClick={onToggleSpeaker}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            !isSpeakerOn
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-[#221442] hover:bg-[#2b1954] text-pink-200 border border-purple-800/60'
          }`}
        >
          {!isSpeakerOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
          <span>{isSpeakerOn ? 'Speaker On' : 'Muted Audio'}</span>
        </button>
      </div>

      <button
        onClick={onLeaveRoom}
        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-md shadow-rose-600/20"
      >
        <LogOut className="w-4 h-4" />
        <span>Leave Room</span>
      </button>
    </div>
  );
};
