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
      <div className="w-full max-w-[410px] bg-gradient-to-b from-[#2A0B34] to-[#12061F] border-2 border-purple-500/50 rounded-3xl p-4 shadow-2xl flex flex-col gap-3">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("QUICK_CHAT")}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                activeTab === "QUICK_CHAT"
                  ? "bg-purple-600 text-white shadow border border-purple-400"
                  : "bg-black/40 text-purple-300"
              }`}
            >
              QUICK CHAT
            </button>
            <button
              onClick={() => setActiveTab("EMOJI")}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
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
            className="w-7 h-7 rounded-full bg-black/40 border border-white/10 text-gray-300 flex items-center justify-center text-sm hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "QUICK_CHAT" ? (
          <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto no-scrollbar py-1">
            {quickMsgs.map((msg, i) => (
              <button
                key={i}
                onClick={() => handleSend(msg)}
                className="p-2.5 bg-black/40 border border-purple-500/30 hover:border-amber-400 rounded-xl text-xs font-bold text-white text-center hover:scale-[1.02] active:scale-95 transition-all shadow"
              >
                {msg}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-h-[220px] overflow-y-auto no-scrollbar p-2">
            {emojis.map((emo, i) => (
              <button
                key={i}
                onClick={() => handleSend(emo)}
                className="text-3xl p-2 rounded-xl bg-black/30 hover:bg-purple-800/40 text-center hover:scale-125 transition-transform"
              >
                {emo}
              </button>
            ))}
          </div>
        )}

        {/* Text Input Row (Matching Image #5) */}
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputMsg)}
            className="flex-1 bg-black/60 border border-purple-500/40 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={() => handleSend(inputMsg)}
            className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-black text-xs hover:bg-amber-400 active:scale-95 transition-transform"
          >
            ➔
          </button>
        </div>
      </div>
    </div>
  );
};
