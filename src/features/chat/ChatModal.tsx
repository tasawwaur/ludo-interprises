import React, { useState } from "react";

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  color?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (msg: string) => void;
  messages?: ChatMessage[];
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, onSendMessage, messages = [] }) => {
  const [activeTab, setActiveTab] = useState<"QUICK_CHAT" | "EMOJI">("QUICK_CHAT");
  const [inputMsg, setInputMsg] = useState("");

  if (!isOpen) return null;

  const quickMsgs = [
    "Good luck!",
    "Well played!",
    "Nice move!",
    "Thanks!",
    "Oops!",
    "Sorry!",
    "Unlucky!",
    "Hehehe!",
  ];

  const emojis = ["😀", "😁", "😂", "😃", "😄", "😅", "😆", "😇", "😈", "😉", "😊", "😋", "😎", "😍", "😘", "🥰"];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    onSendMessage?.(text);
    setInputMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-3">
      <div 
        className="w-full max-w-[270px] bg-cover bg-center border-2 border-amber-400/80 rounded-3xl p-3 shadow-[0_10px_35px_rgba(0,0,0,0.95)] flex flex-col gap-2 mb-4 relative overflow-hidden"
        style={{ backgroundImage: `url('/assets/images/icons/royal_gold_chat_frame.jpg')` }}
      >
        {/* Dark Luxury Overlay */}
        <div className="absolute inset-0 bg-[#0c0316]/60 backdrop-blur-[1px] pointer-events-none z-0"></div>

        {/* Inner Content Layer */}
        <div className="relative z-10 flex flex-col gap-2">
          {/* Header & Close Button */}
          <div className="flex items-center justify-between border-b border-amber-400/20 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">💬</span>
              <span className="text-[10px] font-black text-amber-300 tracking-wider uppercase">In-Game Chat</span>
            </div>
            <button
              onClick={onClose}
              className="w-5 h-5 rounded-full bg-black/70 border border-amber-400/60 text-amber-300 flex items-center justify-center text-[10px] hover:text-white hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 1. CHAT HISTORY CONTAINER (Uper Chat History) */}
          <div className="w-full bg-slate-950/80 border border-purple-500/30 rounded-xl p-2 h-[100px] overflow-y-auto flex flex-col gap-1.5 no-scrollbar shadow-inner">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[9px] text-purple-300/60 font-semibold italic">
                No messages yet. Say hi! 👋
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex flex-col text-[9.5px] leading-tight">
                  <div className="flex items-center justify-between text-[8px] opacity-75 mb-0.5">
                    <span className={`font-extrabold ${msg.color === 'GREEN' ? 'text-emerald-400' : msg.color === 'YELLOW' ? 'text-amber-300' : 'text-cyan-400'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-gray-400">{msg.time}</span>
                  </div>
                  <div className="bg-purple-900/40 border border-purple-500/20 rounded-lg px-2 py-1 text-white font-medium break-words">
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Tabs Selector */}
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("QUICK_CHAT")}
              className={`flex-1 py-1 rounded-lg text-[8.5px] font-black uppercase transition-all ${
                activeTab === "QUICK_CHAT"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow border border-amber-300 font-extrabold"
                  : "bg-black/60 text-purple-200 border border-purple-500/30"
              }`}
            >
              QUICK CHAT
            </button>
            <button
              onClick={() => setActiveTab("EMOJI")}
              className={`flex-1 py-1 rounded-lg text-[8.5px] font-black uppercase transition-all ${
                activeTab === "EMOJI"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow border border-amber-300 font-extrabold"
                  : "bg-black/60 text-purple-200 border border-purple-500/30"
              }`}
            >
              EMOJI
            </button>
          </div>

          {/* Tab Content Options */}
          {activeTab === "QUICK_CHAT" ? (
            <div className="grid grid-cols-2 gap-1 max-h-[85px] overflow-y-auto no-scrollbar py-0.5">
              {quickMsgs.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(msg)}
                  className="p-1 bg-black/40 border border-purple-500/30 hover:border-amber-400 rounded-lg text-[8.5px] font-bold text-white text-center hover:scale-[1.02] active:scale-95 transition-all shadow truncate"
                >
                  {msg}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1 max-h-[85px] overflow-y-auto no-scrollbar p-0.5">
              {emojis.map((emo, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(emo)}
                  className="text-xl p-0.5 bg-transparent border-0 outline-none text-center hover:scale-125 active:scale-95 transition-transform cursor-pointer flex items-center justify-center select-none"
                >
                  {emo}
                </button>
              ))}
            </div>
          )}

          {/* Text Input Row */}
          <div className="flex gap-1 mt-0.5">
            <input
              type="text"
              placeholder="Type message..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(inputMsg)}
              className="flex-1 bg-black/70 border border-purple-500/40 rounded-lg px-2 py-1 text-[8.5px] font-bold text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => handleSend(inputMsg)}
              className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-black text-[9px] hover:bg-amber-400 active:scale-95 transition-transform"
            >
              ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
