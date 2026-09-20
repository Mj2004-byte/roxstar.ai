'use client';

import React, { useState } from 'react';
import { Room } from '../components/Room';
import { SplashScreen } from '../components/SplashScreen';
import { Logo } from '../components/Logo';
import { ArrowRight, Sparkles, Volume2, Mic } from 'lucide-react';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [inRoom, setInRoom] = useState(false);
  const [userName, setUserName] = useState('Rahul');
  const [roomId, setRoomId] = useState('roxstar-voice-room-1');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !roomId.trim()) return;
    setInRoom(true);
  };

  // 1. Show Splash Screen first (Inspired directly by Image 1)
  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  // 2. Show Active Live Room
  if (inRoom) {
    return (
      <Room
        roomId={roomId}
        userIdentity={`user_${userName.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}`}
        userName={userName}
        onLeave={() => setInRoom(false)}
      />
    );
  }

  // 3. Roxstar Landing Page & Join Form
  return (
    <main className="min-h-screen bg-[#0e0b16] text-white flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#160d2b]/85 backdrop-blur-2xl border border-pink-500/30 rounded-3xl p-8 shadow-2xl shadow-pink-600/20 space-y-6 relative z-10">
        
        {/* Branding & Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo size="xl" showText={false} />
          
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>ROXSTAR <span className="text-pink-500">AI</span></span>
            </h1>
            <p className="text-xs text-pink-300/80 font-mono">
              LiveKit Voice Room Assistant
            </p>
          </div>
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5 font-mono">
              Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Rahul or Priya"
              required
              className="w-full bg-[#0d071a] border border-pink-500/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder-pink-300/40 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5 font-mono">
              Room ID / Name
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="roxstar-voice-room-1"
              required
              className="w-full bg-[#0d071a] border border-pink-500/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder-pink-300/40 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl shadow-pink-600/35 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Enter Voice Room</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Features Checklist */}
        <div className="pt-4 border-t border-purple-900/40 text-xs space-y-2">
          <div className="flex items-center gap-2 text-pink-300 font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Highlights:
          </div>
          <ul className="space-y-1.5 text-slate-300 font-sans text-xs">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span>Dual AI Personas (<strong className="text-pink-400">Dost</strong> & <strong className="text-pink-400">Sathi</strong>)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span>Everyday Hinglish / Hindi / English fluency</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span>Multi-user context & barge-in interruption</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => setShowSplash(true)}
          className="w-full text-center text-xs text-pink-400/80 hover:text-pink-300 font-mono transition-colors pt-1"
        >
          ← Replay Splash Screen
        </button>
      </div>
    </main>
  );
}
