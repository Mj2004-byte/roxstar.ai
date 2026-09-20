import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message or address 'AI Dost' / 'AI Sathi'..."
        disabled={disabled}
        className="flex-1 bg-[#160d2b]/90 border border-pink-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-pink-300/40 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-semibold px-5 py-3 rounded-xl flex items-center gap-2 text-sm transition-all disabled:opacity-50 shadow-lg shadow-pink-600/30"
      >
        <span>Send</span>
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};
