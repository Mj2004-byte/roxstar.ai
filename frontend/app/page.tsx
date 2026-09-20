'use client';

import React, { useState } from 'react';
import { Room } from '../components/Room';
import { Mic, Bot, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [inRoom, setInRoom] = useState(false);
  const [userName, setUserName] = useState('Rahul');
  const [roomId, setRoomId] = useState('roxstar-voice-room-1');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !roomId.trim()) return;
    setInRoom(true);
  };

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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Roxstar AI Voice Room</h1>
          <p className="text-sm text-slate-400">
            Join a real-time LiveKit room with dual AI personas (<strong className="text-blue-400">AI Dost</strong> & <strong className="text-purple-400">AI Sathi</strong>).
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Your Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Rahul or Priya"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Room ID / Name
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="roxstar-voice-room-1"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25"
          >
            <span>Join Voice Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Highlights:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-400 font-sans">
            <li>Hinglish / Hindi / English conversational fluency</li>
            <li>Multi-speaker memory & shared context</li>
            <li>Barge-in / Interruption handling</li>
            <li>Turn-managed single speaker response lock</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
