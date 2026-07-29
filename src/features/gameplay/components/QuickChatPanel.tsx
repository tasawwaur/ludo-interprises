import React, { useState } from 'react';
import { Button } from '../../../components/ui';

interface QuickChatPanelProps {
  is4PMode?: boolean;
  onSendMessage: (msg: string) => void;
}

export const QuickChatPanel: React.FC<QuickChatPanelProps> = ({ is4PMode = false, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatChannel, setChatChannel] = useState<'all' | 'team'>('all');

  const emojis = ['😂', '🔥', '🏆', '👍', '👏', '🎯', '👑', '😎', '😡', '😱'];
  const allMessages = ['Good Luck! 🍀', 'Unlucky! 😅', 'Well Played! 👏', 'Hurry Up! ⏰', 'Oops! 🙈', 'GG! 🏆'];
  const teamMessages = ['Pass turn to partner! 🤝', 'Attack Red Token! ⚔️', 'Safe position! 🛡️', 'Cover my Home path! 🏠'];

  const handleSelect = (text: string) => {
    const prefix = chatChannel === 'team' && is4PMode ? '[TEAM] ' : '';
    onSendMessage(`${prefix}${text}`);
    setIsOpen(false);
  };

  const currentMessages = chatChannel === 'team' && is4PMode ? teamMessages : allMessages;

  return (
    <div className="relative">
      {/* Popover Chat Menu */}
      {isOpen && (
        <div className="absolute bottom-12 left-0 z-50 w-72 bg-slate-900/95 border border-slate-700 p-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          {/* Channel Selector for 4P Mode (Custom Chat vs Team Up Chat) */}
          {is4PMode && (
            <div className="flex gap-1 p-1 bg-slate-950 rounded-xl mb-3 border border-slate-800">
              <button
                onClick={() => setChatChannel('all')}
                className={`w-1/2 py-1 text-xs font-bold rounded-lg transition-all ${
                  chatChannel === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Players
              </button>
              <button
                onClick={() => setChatChannel('team')}
                className={`w-1/2 py-1 text-xs font-bold rounded-lg transition-all ${
                  chatChannel === 'team' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🤝 Team Up
              </button>
            </div>
          )}

          {/* Integrated Emojis Section */}
          <div className="mb-3">
            <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">Quick Emojis</span>
            <div className="grid grid-cols-5 gap-1.5 text-2xl">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelect(emoji)}
                  className="p-1 hover:bg-slate-800 rounded-xl transition-transform hover:scale-125 text-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Messages List */}
          <div>
            <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {chatChannel === 'team' && is4PMode ? 'Team Messages' : 'Custom Messages'}
            </span>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {currentMessages.map((msg) => (
                <button
                  key={msg}
                  onClick={() => handleSelect(msg)}
                  className="text-left text-xs font-semibold text-slate-200 p-2 hover:bg-indigo-600/30 rounded-xl transition-colors border border-slate-800/60"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Single Clean Chat Button */}
      <Button
        variant="glass"
        size="sm"
        className="rounded-2xl border-indigo-500/40 hover:bg-indigo-500/30 text-xs font-black px-4 py-2 shadow-lg flex items-center gap-1.5"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬 CHAT
      </Button>
    </div>
  );
};
