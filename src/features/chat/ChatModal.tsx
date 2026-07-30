import React, { useState } from "react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (msg: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, onSendMessage }) => {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-3">
      <div className="w-full max-w-[240px] bg-gradient-to-b from-[#2A0B34] to-[#12061F] border-2 border-purple-500/50 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2 mb-6">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab("QUICK_CHAT")}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                activeTab === "QUICK_CHAT"
                  ? "bg-purple-600 text-white shadow border border-purple-400"
                  : "bg-black/40 text-purple-300"
              }`}
            >
              QUICK CHAT
            </button>
            <button
              onClick={() => setActiveTab("EMOJI")}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                activeTab === "EMOJI"
                  ? "bg-purple-600 text-white shadow border border-purple-400"
                  : "bg-black/40 text-purple-300"
              }`}
            >
              EMOJI
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full bg-black/40 border border-white/10 text-gray-300 flex items-center justify-center text-[10px] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "QUICK_CHAT" ? (
          <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto no-scrollbar py-1">
            {quickMsgs.map((msg, i) => (
              <button
                key={i}
                onClick={() => handleSend(msg)}
                className="p-1.5 bg-black/40 border border-purple-500/30 hover:border-amber-400 rounded-lg text-[9px] font-bold text-white text-center hover:scale-[1.02] active:scale-95 transition-all shadow"
              >
                {msg}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 max-h-[130px] overflow-y-auto no-scrollbar p-1">
            {emojis.map((emo, i) => (
              <button
                key={i}
                onClick={() => handleSend(emo)}
                className="text-2xl p-1 bg-transparent border-0 outline-none text-center hover:scale-135 active:scale-95 transition-transform cursor-pointer flex items-center justify-center select-none filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
              >
                {emo}
              </button>
            ))}
          </div>
        )}

        {/* Text Input Row */}
        <div className="flex gap-1.5 mt-0.5">
          <input
            type="text"
            placeholder="Type message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputMsg)}
            className="flex-1 bg-black/60 border border-purple-500/40 rounded-lg px-2 py-1 text-[9.5px] font-bold text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={() => handleSend(inputMsg)}
            className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-black text-[10px] hover:bg-amber-400 active:scale-95 transition-transform"
          >
            ➔
          </button>
        </div>
      </div>
    </div>
  );
};
