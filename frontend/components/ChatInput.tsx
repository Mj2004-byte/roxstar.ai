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
        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl flex items-center gap-2 text-sm transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md shadow-blue-600/20"
      >
        <span>Send</span>
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};
