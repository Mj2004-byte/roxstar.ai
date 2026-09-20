import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Mic, Heart, Play, Sparkles, Volume2 } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [liked, setLiked] = useState(false);
  const [equalizerHeights, setEqualizerHeights] = useState<number[]>([
    40, 70, 90, 60, 85, 50, 95, 75, 60, 80, 90, 65, 85, 45, 70, 90, 55, 80
  ]);

  // Animate equalizer bars dynamically like Image 1
  useEffect(() => {
    const interval = setInterval(() => {
      setEqualizerHeights(
        Array.from({ length: 18 }, () => Math.floor(Math.random() * 65) + 30)
      );
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0b16] text-white flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="w-full max-w-md flex justify-between items-center pt-2">
        <Logo size="md" />
        <span className="bg-pink-500/10 text-pink-400 border border-pink-500/30 text-xs px-3 py-1 rounded-full font-mono font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          Ready
        </span>
      </div>

      {/* Main Equalizer & Track Card (Inspired directly by Image 1) */}
      <div className="w-full max-w-sm bg-[#160d2b]/80 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-8 flex flex-col items-center shadow-2xl shadow-pink-600/20 my-auto space-y-6">
        
        {/* Visualizer Spectrum Bars (Exact match to Image 1) */}
        <div className="h-28 w-full flex items-end justify-center gap-1.5 px-4 pt-4">
          {equalizerHeights.map((height, idx) => (
            <div
              key={idx}
              style={{ height: `${height}%` }}
              className="w-2.5 bg-gradient-to-t from-rose-600 via-pink-500 to-pink-400 rounded-full transition-all duration-150 shadow-md shadow-pink-500/40"
            />
          ))}
        </div>

        {/* Track Title & Subtitle */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>Roxstar AI Voice Room</span>
          </h2>
          <p className="text-xs font-medium text-pink-300/80 font-mono">
            Dual AI Personas: Dost & Sathi
          </p>
        </div>

        {/* Progress Bar (Image 1 Style) */}
        <div className="w-full space-y-1.5 pt-2">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-pink-600 to-pink-400 rounded-full animate-pulse" />
          </div>
          <div className="flex justify-between text-[10px] text-pink-300/60 font-mono">
            <span>00:15</span>
            <span>Live Voice AI</span>
          </div>
        </div>

        {/* Interactive Controls (Image 1 Style: Heart, Large Pink Mic Button, Play) */}
        <div className="flex items-center justify-center gap-8 pt-4 w-full">
          <button
            onClick={() => setLiked(!liked)}
            className={`p-3 rounded-full transition-all ${
              liked ? 'text-pink-500 bg-pink-500/20 scale-110' : 'text-slate-400 hover:text-pink-400 hover:bg-slate-800/60'
            }`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-pink-500' : ''}`} />
          </button>

          {/* Central Circular Pink Microphone Action Button */}
          <button
            onClick={onEnter}
            className="group relative w-20 h-20 rounded-full bg-gradient-to-tr from-pink-600 via-pink-500 to-rose-400 text-white flex items-center justify-center shadow-xl shadow-pink-600/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="absolute -inset-2 rounded-full bg-pink-500/30 animate-ping group-hover:bg-pink-500/50 pointer-events-none" />
            <Mic className="w-10 h-10 drop-shadow-md group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={onEnter}
            className="p-3 rounded-full text-slate-400 hover:text-pink-400 hover:bg-slate-800/60 transition-all"
          >
            <Play className="w-6 h-6 fill-current" />
          </button>
        </div>

        <p className="text-[11px] text-pink-200/70 font-sans text-center pt-2">
          Click the <strong className="text-pink-400">Mic Button</strong> to enter the live voice room
        </p>
      </div>

      {/* Footer Features */}
      <div className="w-full max-w-md text-center text-xs text-slate-400 flex items-center justify-center gap-4 font-mono pb-2">
        <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-pink-400" /> Hinglish Voice AI</span>
        <span>•</span>
        <span>Speaker Memory</span>
        <span>•</span>
        <span>Barge-in Support</span>
      </div>
    </div>
  );
};
