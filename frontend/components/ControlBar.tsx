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
    <div className="bg-[#140d28]/90 border border-[#2d1b50] rounded-xl p-2.5 shadow-xl flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
            isMuted
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              : 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm shadow-pink-600/30'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isMuted ? 'Mic Off' : 'Mic On'}</span>
        </button>

        <button
          onClick={onToggleSpeaker}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
            !isSpeakerOn
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'bg-[#221442] hover:bg-[#2b1954] text-pink-200 border border-purple-800/60'
          }`}
        >
          {!isSpeakerOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
          <span>{isSpeakerOn ? 'Speaker On' : 'Muted'}</span>
        </button>
      </div>

      <button
        onClick={onLeaveRoom}
        className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all shadow-sm shadow-rose-600/20 active:scale-95"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Leave</span>
      </button>
    </div>
  );
};
