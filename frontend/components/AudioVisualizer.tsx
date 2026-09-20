import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Heart, Play } from 'lucide-react';

interface AudioVisualizerProps {
  currentSpeakerName?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  currentSpeakerName,
  isSpeaking,
  isMuted,
  onToggleMute,
}) => {
  const [liked, setLiked] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>([
    30, 55, 80, 45, 90, 60, 75, 50, 85, 40, 70, 95, 60, 80, 50, 65, 85
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking) {
      interval = setInterval(() => {
        setBarHeights(
          Array.from({ length: 17 }, () => Math.floor(Math.random() * 70) + 30)
        );
      }, 120);
    } else {
      setBarHeights([20, 25, 20, 30, 25, 20, 35, 20, 25, 30, 20, 25, 20, 30, 25, 20, 25]);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <div className="bg-[#160d2b]/90 border border-pink-500/30 rounded-2xl p-4 shadow-xl shadow-pink-600/10 flex flex-col items-center justify-between gap-3">
      {/* Equalizer Spectrum Bars (Matching Image 1) */}
      <div className="h-16 w-full flex items-end justify-center gap-1.5 px-2">
        {barHeights.map((height, idx) => (
          <div
            key={idx}
            style={{ height: `${height}%` }}
            className={`w-2 rounded-full transition-all duration-150 ${
              isSpeaking
                ? 'bg-gradient-to-t from-pink-600 via-pink-500 to-rose-400 shadow-sm shadow-pink-500/50'
                : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Speaker / Track Info */}
      <div className="text-center">
        <div className="text-sm font-bold text-white tracking-wide flex items-center justify-center gap-2">
          <span>{currentSpeakerName || 'Room Active'}</span>
          {isSpeaking && (
            <span className="bg-pink-500/20 text-pink-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium animate-pulse">
              LIVE SPEAKING
            </span>
          )}
        </div>
        <p className="text-xs text-pink-300/70 font-mono">
          {isSpeaking ? 'Voice AI Pipeline Active' : 'Waiting for voice or text turn...'}
        </p>
      </div>

      {/* Action Controls matching Image 1: Heart, Pink Mic Button, Play */}
      <div className="flex items-center gap-6 pt-1">
        <button
          onClick={() => setLiked(!liked)}
          className={`p-2 rounded-full transition-all ${
            liked ? 'text-pink-500 bg-pink-500/20' : 'text-slate-400 hover:text-pink-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-pink-500' : ''}`} />
        </button>

        {/* Circular Glowing Pink Microphone Button */}
        <button
          onClick={onToggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isMuted
              ? 'bg-slate-800 text-rose-400 border border-rose-500/40'
              : 'bg-gradient-to-tr from-pink-600 to-pink-400 text-white shadow-pink-600/40 hover:scale-105 active:scale-95'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 drop-shadow" />}
        </button>

        <button className="p-2 rounded-full text-slate-400 hover:text-pink-400 transition-all">
          <Play className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
};
