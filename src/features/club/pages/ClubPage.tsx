import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import confetti from "canvas-confetti";

interface ClubPageProps {
  onBack?: () => void;
}

type ClubTab =
  | "HOME"
  | "MEMBERS"
  | "CHAT"
  | "GAMES"
  | "TOURNAMENT"
  | "MISSIONS"
  | "REWARDS"
  | "RANKINGS"
  | "SHOP"
  | "EVENTS"
  | "ACTIVITY"
  | "SETTINGS"
  | "MANAGEMENT";

interface Member {
  id: string;
  name: string;
  avatar?: string;
  role: "Leader" | "Co-Leader" | "Elder" | "VIP Member" | "Member";
  isOnline: boolean;
  lastSeen?: string;
  contributions: number;
  winRate: string;
  trophies: number;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isGift?: boolean;
  giftType?: "COINS" | "GEMS";
  giftAmount?: number;
  replyTo?: string;
}

export const ClubPage: React.FC<ClubPageProps> = ({ onBack }) => {
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);

  const [activeTab, setActiveTab] = useState<ClubTab>("HOME");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Home states
  const [clubName, setClubName] = useState("ROYAL LUXE 🏰");
  const [clubAnn, setClubAnn] = useState("🏆 Let's climb to Top 10 globally! Play daily matches & donate coins.");
  const [clubDesc, setClubDesc] = useState("Premium club for elite Ludo players. Weekly tournaments, active chatting & generous gifting!");
  const [clubPrivacy, setClubPrivacy] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [clubLevel, setClubLevel] = useState(15);
  const [clubId, setClubId] = useState("#987621");

  // Members states
  const [members, setMembers] = useState<Member[]>([
    { id: "m1", name: user?.displayName || user?.username || "TASAVVUR", role: "Leader", isOnline: true, contributions: 1200, winRate: "72%", trophies: 3400 },
    { id: "m2", name: "GUEST MALIK", role: "Co-Leader", isOnline: true, contributions: 950, winRate: "65%", trophies: 2900 },
    { id: "m3", name: "LUDO KING", role: "Elder", isOnline: true, contributions: 620, winRate: "58%", trophies: 2450 },
    { id: "m4", name: "ALEX", role: "VIP Member", isOnline: false, lastSeen: "2h ago", contributions: 550, winRate: "62%", trophies: 2200 },
    { id: "m5", name: "GUEST 4819", role: "Member", isOnline: false, lastSeen: "1d ago", contributions: 120, winRate: "45%", trophies: 1100 },
    { id: "m6", name: "SHIVAM", role: "Member", isOnline: true, contributions: 80, winRate: "48%", trophies: 950 },
    { id: "m7", name: "NEHA 👑", role: "VIP Member", isOnline: false, lastSeen: "30m ago", contributions: 450, winRate: "60%", trophies: 1850 },
  ]);
  const [searchMember, setSearchMember] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "c1", senderName: "GUEST MALIK", senderRole: "Co-Leader", content: "Hey guys! Who is up for a Private Match?", timestamp: "8:35 PM" },
    { id: "c2", senderName: "LUDO KING", senderRole: "Elder", content: "Count me in! Create a private table, I'll join.", timestamp: "8:37 PM" }
  ]);
  const [inputText, setInputText] = useState("");
  const [replyMessage, setReplyMessage] = useState<ChatMessage | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState<string>("📌 Sunday Club Championship at 9:00 PM! Cash reward pool of ₹5,000 + 10,000 Coins!");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Games states
  const [activeTables, setActiveTables] = useState([
    { id: "t1", host: "GUEST MALIK", type: "Private Match", players: 2, capacity: 4, bet: 1000 },
    { id: "t2", host: "LUDO KING", type: "Team Match", players: 3, capacity: 4, bet: 2500 }
  ]);

  // Tournament states
  const [tournaments, setTournaments] = useState([
    { id: "tr1", name: "Grand Arena Championship", status: "LIVE", prize: "50,000 Coins", participants: 16 },
    { id: "tr2", name: "Sunday Elite Cup", status: "UPCOMING", prize: "100 Gems", time: "Starts in 4h 15m" }
  ]);

  // Missions states
  const [missions, setMissions] = useState([
    { id: "m_d1", title: "Play 3 matches with members", progress: 2, target: 3, xp: 20, claimed: false, type: "DAILY" },
    { id: "m_w1", title: "Donate 10,000 Coins to Chest", progress: 5000, target: 10000, xp: 50, claimed: false, type: "WEEKLY" },
    { id: "m_m1", title: "Win 10 team matches", progress: 4, target: 10, xp: 150, claimed: false, type: "MONTHLY" }
  ]);

  // Rewards states
  const [clubChestCoins, setClubChestCoins] = useState(45000);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Shop states
  const [shopItems] = useState([
    { id: "s1", name: "Luxe Shield Frame", type: "Frames", cost: 1500, img: "🖼️" },
    { id: "s2", name: "Royal Purple Dice", type: "Dice", cost: 3000, img: "🎲" },
    { id: "s3", name: "Castle Board skin", type: "Boards", cost: 5000, img: "🏰" },
    { id: "s4", name: "Golden Aura Effect", type: "Effects", cost: 2000, img: "✨" }
  ]);
  const [clubPoints, setClubPoints] = useState(2500);

  // Events state
  const [currentEvent, setCurrentEvent] = useState({
    title: "Double Contribution Weekend!",
    desc: "Earn 2x Club points and XP for all matches played with club members.",
    timeLeft: "1d 12h remaining"
  });

  // Settings & Management states
  const [joinRequests, setJoinRequests] = useState([
    { id: "req1", name: "RAHUL_YT", level: 18, trophies: 2300 },
    { id: "req2", name: "SIMRAN_88", level: 14, trophies: 1950 },
  ]);
  const [banList, setBanList] = useState<string[]>(["SPAMMER_07", "HACKER_PRO"]);
  const [minTrophiesReq, setMinTrophiesReq] = useState(1000);
  const [auditLogs, setAuditLogs] = useState([
    { action: "GUEST MALIK promoted ALEX to VIP Member", time: "2h ago" },
    { action: "TASAVVUR updated Club Announcement", time: "4h ago" },
    { action: "LUDO KING donated 5,000 Coins to Club Chest", time: "6h ago" },
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: `c_${Date.now()}`,
      senderName: user?.displayName || user?.username || "TASAVVUR",
      senderRole: "Leader",
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyMessage ? `${replyMessage.senderName}: ${replyMessage.content}` : undefined
    };
    setChatMessages([...chatMessages, newMsg]);
    setInputText("");
    setReplyMessage(null);
  };

  // Gift handling
  const handleSendGift = (type: "COINS" | "GEMS", amount: number) => {
    const userCoins = user?.coins || 0;
    const userGems = user?.gems || 0;
    if (type === "COINS" && userCoins < amount) {
      triggerToast("❌ Insufficient Coins!");
      return;
    }
    if (type === "GEMS" && userGems < amount) {
      triggerToast("❌ Insufficient Gems!");
      return;
    }
    if (type === "COINS") updateUser({ coins: userCoins - amount });
    else updateUser({ gems: userGems - amount });

    confetti({ particleCount: 50, spread: 60 });
    const newMsg: ChatMessage = {
      id: `c_${Date.now()}`,
      senderName: user?.displayName || user?.username || "TASAVVUR",
      senderRole: "Leader",
      content: `🎁 shared a Club Gift!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGift: true,
      giftType: type,
      giftAmount: amount
    };
    setChatMessages([...chatMessages, newMsg]);
    triggerToast("🎁 Gift sent to Club Chat!");
  };

  const handleClaimGift = (msg: ChatMessage) => {
    if (!msg.giftAmount || !msg.giftType) return;
    const userCoins = user?.coins || 0;
    const userGems = user?.gems || 0;
    if (msg.giftType === "COINS") {
      updateUser({ coins: userCoins + msg.giftAmount });
      triggerToast(`Claimed +${msg.giftAmount} Coins! 🪙`);
    } else {
      updateUser({ gems: userGems + msg.giftAmount });
      triggerToast(`Claimed +${msg.giftAmount} Gems! 💎`);
    }
    setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: `🎁 Gift Claimed! +${msg.giftAmount} ${msg.giftType}` } : m));
    confetti({ particleCount: 20 });
  };

  // Member management handlers
  const handlePromote = (m: Member) => {
    const roles: Member["role"][] = ["Member", "VIP Member", "Elder", "Co-Leader", "Leader"];
    const currIdx = roles.indexOf(m.role);
    if (currIdx < roles.length - 2) {
      const nextRole = roles[currIdx + 1];
      setMembers(prev => prev.map(item => item.id === m.id ? { ...item, role: nextRole } : item));
      setAuditLogs([{ action: `TASAVVUR promoted ${m.name} to ${nextRole}`, time: "Just now" }, ...auditLogs]);
      triggerToast(`Promoted ${m.name} to ${nextRole}!`);
      setSelectedMember(null);
    }
  };

  const handleDemote = (m: Member) => {
    const roles: Member["role"][] = ["Member", "VIP Member", "Elder", "Co-Leader", "Leader"];
    const currIdx = roles.indexOf(m.role);
    if (currIdx > 0 && m.role !== "Leader") {
      const prevRole = roles[currIdx - 1];
      setMembers(prev => prev.map(item => item.id === m.id ? { ...item, role: prevRole } : item));
      setAuditLogs([{ action: `TASAVVUR demoted ${m.name} to ${prevRole}`, time: "Just now" }, ...auditLogs]);
      triggerToast(`Demoted ${m.name} to ${prevRole}!`);
      setSelectedMember(null);
    }
  };

  const handleKick = (m: Member) => {
    setMembers(prev => prev.filter(item => item.id !== m.id));
    setAuditLogs([{ action: `TASAVVUR kicked ${m.name}`, time: "Just now" }, ...auditLogs]);
    triggerToast(`Kicked ${m.name}! 🚪`);
    setSelectedMember(null);
  };

  const handleTransferLeadership = (m: Member) => {
    setMembers(prev => prev.map(item => {
      if (item.id === "m1") return { ...item, role: "Co-Leader" as const };
      if (item.id === m.id) return { ...item, role: "Leader" as const };
      return item;
    }));
    setAuditLogs([{ action: `TASAVVUR transferred leadership to ${m.name}`, time: "Just now" }, ...auditLogs]);
    triggerToast(`Transferred leadership to ${m.name}! 👑`);
    setSelectedMember(null);
  };

  // Scroll to bottom on Chat
  useEffect(() => {
    if (activeTab === "CHAT") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="shop" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 overflow-hidden">
        
        {/* ── LUXURY HEADER BAR ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-purple-500/10 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-lg hover:bg-black/70 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-black tracking-widest bg-gradient-to-r from-purple-200 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent uppercase glow-purple-text flex items-center gap-1.5 leading-none">
              🏰 {clubName}
            </h1>
            <span className="text-[9px] font-bold text-purple-300/80 mt-1">Lv. {clubLevel} • {clubId}</span>
          </div>

          <div className="flex items-center gap-1 bg-black/60 border border-purple-500/30 px-2.5 py-1 rounded-full shadow-inner">
            <img src="/assets/images/icons/icon_gem.png" className="w-[12px] h-[12px] object-contain" alt="Crowns" />
            <span className="text-[10px] font-black text-purple-300 font-mono">
              {(user?.crowns ?? 2).toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── LUXURY HORIZONTAL TAB BAR (13 tabs, scrollable) ── */}
        <div className="w-full bg-[#1A0C2E]/90 border-b border-purple-500/10 py-2.5 px-3 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
          {([
            { id: "HOME", label: "Home", icon: "🏠" },
            { id: "MEMBERS", label: "Members", icon: "👥" },
            { id: "CHAT", label: "Chat", icon: "💬" },
            { id: "GAMES", label: "Games", icon: "🎲" },
            { id: "TOURNAMENT", label: "Tournament", icon: "🏆" },
            { id: "MISSIONS", label: "Missions", icon: "🎯" },
            { id: "REWARDS", label: "Rewards", icon: "🎁" },
            { id: "RANKINGS", label: "Rankings", icon: "📊" },
            { id: "SHOP", label: "Shop", icon: "💰" },
            { id: "EVENTS", label: "Events", icon: "📅" },
            { id: "ACTIVITY", label: "Activity", icon: "📈" },
            { id: "SETTINGS", label: "Settings", icon: "⚙️" },
            { id: "MANAGEMENT", label: "Management", icon: "🔒" }
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all whitespace-nowrap border ${
                activeTab === t.id
                  ? "bg-gradient-to-r from-purple-600 via-fuchsia-700 to-indigo-800 text-white border-purple-400 shadow-md scale-105"
                  : "bg-black/30 border-purple-800/20 text-purple-300/60 hover:text-white"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT SCROLLABLE VIEW ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 pb-20">
          
          {/* 1. HOME TAB */}
          {activeTab === "HOME" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl p-4 flex flex-col justify-end min-h-[130px] bg-gradient-to-b from-[#35105E]/40 to-[#0F0220]">
                <div className="absolute inset-0 bg-[url('/assets/images/board_classic.png')] bg-cover opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full border border-yellow-300 shadow">
                  RANK #12
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-rose-600 p-[2px] shadow-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-full h-full bg-[#1C0830] rounded-[14px] flex items-center justify-center text-3xl">🏰</div>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white leading-tight">{clubName}</h2>
                    <p className="text-[10px] text-amber-300 font-bold mt-0.5">Lv. {clubLevel} • Elite Royal League</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-xl">👥</span>
                  <span className="text-[10px] font-bold text-purple-200 mt-1">Club Members</span>
                  <span className="text-base font-black text-white mt-0.5">{members.length} / 30</span>
                </div>
                <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-xl">🟢</span>
                  <span className="text-[10px] font-bold text-purple-200 mt-1">Online Now</span>
                  <span className="text-base font-black text-emerald-400 mt-0.5">{members.filter(m=>m.isOnline).length} Active</span>
                </div>
              </div>

              <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">📢 Club Announcement</span>
                <p className="text-xs text-purple-200 italic">"{clubAnn}"</p>
              </div>

              <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3">
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block mb-1">ℹ️ Description</span>
                <p className="text-xs text-purple-300/90">"{clubDesc}"</p>
              </div>

              <button
                onClick={() => triggerToast("Invite link copied to clipboard! 🔗")}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-widest border border-yellow-300 hover:brightness-110 active:scale-95 transition-all shadow"
              >
                Join / Invite Members
              </button>
            </div>
          )}

          {/* 2. MEMBERS TAB */}
          {activeTab === "MEMBERS" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <input
                type="text"
                placeholder="🔍 Search Player..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full py-2 pl-4 bg-purple-950/60 border border-purple-500/20 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <div className="flex flex-col gap-2">
                {members.filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase())).map(m => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/40 border border-purple-850/40 hover:border-purple-500/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-800 border border-purple-500/20 flex items-center justify-center text-sm font-black relative flex-shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#12061F] ${m.isOnline ? "bg-emerald-400 shadow-[0_0_6px_#10B981]" : "bg-slate-500"}`}></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{m.name}</span>
                          <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded border bg-purple-900 border-purple-400 text-white">{m.role}</span>
                        </div>
                        <span className="text-[8px] text-purple-300">Trophies: {m.trophies} • Cont: {m.contributions} XP</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400">{m.isOnline ? "Online" : m.lastSeen}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CLUB CHAT */}
          {activeTab === "CHAT" && (
            <div className="flex flex-col h-[calc(100vh-230px)] justify-between animate-in fade-in duration-200">
              <div className="bg-purple-950/80 border border-amber-500/20 rounded-xl p-2.5 mb-2 flex items-center justify-between">
                <p className="text-[9px] font-bold text-amber-300 flex-1 truncate">{pinnedMessage}</p>
                <button onClick={() => setPinnedMessage("")} className="text-amber-200 font-bold text-xs ml-2">✕</button>
              </div>

              {/* Voice Message Box mock */}
              <div className="bg-black/30 border border-purple-500/10 p-2.5 rounded-2xl mb-3 flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsPlayingAudio(!isPlayingAudio);
                    triggerToast(isPlayingAudio ? "Audio Paused" : "Playing voice message from Co-Leader...");
                  }}
                  className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center text-sm"
                >
                  {isPlayingAudio ? "⏸️" : "▶️"}
                </button>
                <div className="flex-1 flex gap-0.5 items-center">
                  {[2, 4, 6, 8, 3, 5, 2, 7, 9, 4, 3, 6, 8, 5, 2, 4, 6, 3].map((h, i) => (
                    <div
                      key={i}
                      className={`w-0.5 rounded-full transition-all ${isPlayingAudio ? "bg-amber-400 animate-pulse" : "bg-purple-600"}`}
                      style={{ height: `${h * 2}px` }}
                    ></div>
                  ))}
                </div>
                <span className="text-[8px] text-slate-400 font-mono">0:12</span>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 p-1.5">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="flex flex-col gap-1">
                    {msg.replyTo && (
                      <span className="text-[8px] text-purple-300/70 italic ml-11">↩️ {msg.replyTo}</span>
                    )}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-900 border border-purple-500/20 flex items-center justify-center text-xs font-black">{msg.senderName.charAt(0).toUpperCase()}</div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] font-black text-purple-200">{msg.senderName}</span>
                          <span className="text-[7px] text-slate-500">{msg.timestamp}</span>
                        </div>
                        {msg.isGift ? (
                          <div className="bg-gradient-to-r from-purple-800 to-indigo-900 border border-amber-400 p-2.5 rounded-2xl mt-1 flex flex-col items-center gap-1.5 max-w-[180px] shadow">
                            <span className="text-[10px] font-bold">🎁 shared a Club Gift!</span>
                            <span className="text-xs font-black text-amber-300">{msg.giftAmount} {msg.giftType}</span>
                            {msg.content.includes("Claimed") ? (
                              <span className="text-[8px] text-emerald-400 font-black">CLAIMED</span>
                            ) : (
                              <button onClick={() => handleClaimGift(msg)} className="px-3 py-1 bg-yellow-400 text-slate-950 font-black text-[9px] rounded-lg">CLAIM</button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-purple-950/40 border border-purple-800/20 p-2 rounded-2xl rounded-tl-none mt-1 text-xs text-white max-w-[90%]">{msg.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>

              <div className="flex flex-col gap-2 bg-black/40 p-2 border-t border-purple-500/10 relative">
                {showStickers && (
                  <div className="absolute bottom-[105%] left-2 right-2 bg-[#1C0A33] border border-purple-500/30 p-2.5 rounded-2xl z-50">
                    <span className="text-[8px] font-black text-purple-300 uppercase tracking-widest block mb-2">🎁 Shared Rewards / Gifts</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { handleSendGift("COINS", 5000); setShowStickers(false); }} className="py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-[9px] rounded-lg">🎁 Send 5K Coins</button>
                      <button onClick={() => { handleSendGift("GEMS", 50); setShowStickers(false); }} className="py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black text-[9px] rounded-lg">🎁 Send 50 Gems</button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setShowStickers(!showStickers)} className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/20 flex items-center justify-center text-lg">🎁</button>
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                    className="flex-1 px-4 bg-purple-950/60 border border-purple-500/20 rounded-xl text-xs text-white focus:outline-none"
                  />
                  <button onClick={handleSendMessage} className="px-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl font-black text-xs uppercase">Send</button>
                </div>
              </div>
            </div>
          )}

          {/* 4. CLUB GAMES */}
          {activeTab === "GAMES" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => triggerToast("Created Private Ludo Table! 🎲")} className="py-3 bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow active:scale-95 transition-all">
                  <span className="text-xl">🏠</span>
                  <span className="text-[10px] font-black uppercase">Create Table</span>
                </button>
                <button onClick={() => triggerToast("Registered for Team 2v2 Match! 👥")} className="py-3 bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow active:scale-95 transition-all">
                  <span className="text-xl">👥</span>
                  <span className="text-[10px] font-black uppercase">Team Match</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Active Table Rooms</span>
                {activeTables.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-purple-950/40 border border-purple-800/40 p-3 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-white">{t.host}'s Table</span>
                      <span className="text-[8px] text-purple-300 block mt-0.5">{t.type} • Bet: {t.bet} Coins</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-purple-200">{t.players} / {t.capacity} Players</span>
                      <button onClick={() => triggerToast("Joined Table Lobby!")} className="px-3.5 py-1.5 bg-yellow-400 text-slate-950 font-black text-[9px] rounded-xl active:scale-95">JOIN</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. CLUB TOURNAMENT */}
          {activeTab === "TOURNAMENT" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="bg-gradient-to-br from-[#2D124D] to-[#160627] border-2 border-amber-500/40 rounded-3xl p-4 text-center">
                <span className="text-xl">🏆</span>
                <h3 className="text-sm font-black text-amber-200 tracking-wider uppercase mt-1">Club League Championship</h3>
                <p className="text-[10px] text-purple-300 mt-0.5">Top performing clubs win weekly diamond rewards!</p>
              </div>

              <div className="flex flex-col gap-2">
                {tournaments.map(tr => (
                  <div key={tr.id} className="flex justify-between items-center bg-purple-950/40 border border-purple-800/40 p-3.5 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-white">{tr.name}</span>
                      <span className="text-[9px] text-purple-300 block mt-0.5">Prize: {tr.prize} • Status: {tr.status}</span>
                    </div>
                    <button
                      onClick={() => triggerToast(tr.status === "LIVE" ? "Spectating Match..." : "Registered!")}
                      className={`px-3.5 py-1.5 font-black text-[9px] rounded-xl active:scale-95 ${tr.status === "LIVE" ? "bg-emerald-500 text-white" : "bg-yellow-400 text-slate-950"}`}
                    >
                      {tr.status === "LIVE" ? "SPECTATE" : "REGISTER"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. TARGET/MISSIONS */}
          {activeTab === "MISSIONS" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              {missions.map(mis => (
                <div key={mis.id} className="bg-purple-950/40 border border-purple-800/40 p-3 rounded-2xl flex justify-between items-center">
                  <div className="flex-1 pr-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-black text-white">{mis.title}</span>
                      <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${mis.type === 'DAILY' ? 'bg-indigo-900 border border-indigo-500' : 'bg-purple-900 border border-purple-500'}`}>{mis.type}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-purple-300 mb-1">
                      <span>Reward: +{mis.xp} Club XP</span>
                      <span>{mis.progress} / {mis.target}</span>
                    </div>
                    <div className="w-full h-2 bg-purple-950 border border-purple-900 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-full" style={{ width: `${(mis.progress/mis.target)*100}%` }}></div>
                    </div>
                  </div>
                  {mis.progress >= mis.target ? (
                    <button
                      disabled={mis.claimed}
                      onClick={() => {
                        setMissions(prev => prev.map(m => m.id === mis.id ? { ...m, claimed: true } : m));
                        setClubPoints(p => p + mis.xp * 10);
                        confetti({ particleCount: 30 });
                        triggerToast(`Claimed reward! +${mis.xp * 10} Club Points!`);
                      }}
                      className={`px-3 py-2 font-black text-[9px] rounded-xl flex-shrink-0 ${mis.claimed ? "bg-slate-800 text-slate-400" : "bg-emerald-500 text-white"}`}
                    >
                      {mis.claimed ? "CLAIMED" : "CLAIM"}
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold px-3">LOCK</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 7. CLUB REWARDS */}
          {activeTab === "REWARDS" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="bg-gradient-to-br from-[#2D124D] to-[#160627] border border-purple-500/20 rounded-3xl p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <img src="/assets/images/icons/luxury_chest.png" className="w-[50px] h-[50px] object-contain animate-bounce" alt="Chest" />
                  <div>
                    <span className="text-xs font-black text-purple-200">Club Chest Level 5</span>
                    <span className="text-[9px] text-amber-400 block mt-0.5">Collect rewards in: 2 days</span>
                  </div>
                </div>
                <button onClick={() => triggerToast("Rewards collected! +10,000 Coins 🪙")} className="px-3 py-1.5 bg-yellow-400 text-slate-950 font-black text-[9px] rounded-xl">COLLECT</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={dailyClaimed}
                  onClick={() => {
                    setDailyClaimed(true);
                    updateUser({ coins: (user?.coins || 0) + 1000 });
                    confetti({ particleCount: 15 });
                    triggerToast("Claimed Daily Bonus +1,000 Coins!");
                  }}
                  className={`py-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-purple-500/20 ${dailyClaimed ? "bg-slate-950/20 text-slate-500" : "bg-purple-950/40 text-amber-300"}`}
                >
                  <span className="text-xl">🎁</span>
                  <span className="text-[9px] font-black uppercase">Daily Bonus</span>
                </button>
                <button
                  onClick={() => {
                    if (isSpinning) return;
                    setIsSpinning(true);
                    triggerToast("Spinning Lucky Wheel... 🎡");
                    setTimeout(() => {
                      setIsSpinning(false);
                      confetti({ particleCount: 30 });
                      triggerToast("You won VIP Badge & 200 Gems! 💎");
                    }, 2000);
                  }}
                  className="py-3 bg-purple-950/40 border border-purple-500/20 text-blue-300 rounded-2xl flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-xl">🎡</span>
                  <span className="text-[9px] font-black uppercase">Lucky Spin</span>
                </button>
              </div>
            </div>
          )}

          {/* 8. RANKINGS */}
          {activeTab === "RANKINGS" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Season Win Rate Rankings</span>
              <div className="flex flex-col gap-2">
                {members.sort((a,b) => parseFloat(b.winRate) - parseFloat(a.winRate)).map((m, idx) => (
                  <div key={m.id} className="flex justify-between items-center bg-purple-950/40 border border-purple-800/40 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? "bg-yellow-400 text-slate-950" : idx === 1 ? "bg-slate-300 text-slate-950" : idx === 2 ? "bg-orange-400 text-slate-950" : "bg-purple-900"}`}>{idx + 1}</span>
                      <span className="text-xs font-black text-white">{m.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-300">{m.winRate} Win Rate</span>
                      <span className="text-[8px] text-purple-300 block mt-0.5">Rank {idx + 1} MVP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. CLUB SHOP */}
          {activeTab === "SHOP" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex justify-between items-center bg-black/30 border border-purple-500/20 p-3 rounded-2xl">
                <span className="text-xs font-bold text-purple-200">Club Contribution Points</span>
                <span className="text-sm font-black text-amber-400 font-mono">{clubPoints} pts</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {shopItems.map(item => (
                  <div key={item.id} className="bg-purple-950/60 border-2 border-purple-500/30 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative">
                    <span className="absolute top-2 right-2 bg-purple-900 border border-purple-400 text-white text-[7px] font-black px-1.5 py-0.5 rounded">{item.type}</span>
                    <span className="text-3xl my-3">{item.img}</span>
                    <span className="text-xs font-black text-white">{item.name}</span>
                    <button
                      onClick={() => {
                        if (clubPoints < item.cost) {
                          triggerToast("❌ Insufficient Club Points!");
                          return;
                        }
                        setClubPoints(p => p - item.cost);
                        confetti({ particleCount: 30 });
                        triggerToast(`Purchased ${item.name}! Check Inventory.`);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] rounded-xl border border-yellow-300 mt-2 uppercase"
                    >
                      {item.cost} pts
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. EVENTS */}
          {activeTab === "EVENTS" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="bg-gradient-to-br from-[#2D124D] to-[#160627] border-2 border-purple-500/40 rounded-3xl p-4 shadow-xl">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">🎉 Active Event</span>
                <h3 className="text-sm font-black text-white mt-1.5">{currentEvent.title}</h3>
                <p className="text-xs text-purple-200 mt-1 leading-relaxed">{currentEvent.desc}</p>
                <div className="w-full h-[1px] bg-purple-800/40 my-3"></div>
                <span className="text-[10px] text-amber-300 font-bold">{currentEvent.timeLeft}</span>
              </div>
            </div>
          )}

          {/* 11. ACTIVITY LOGS */}
          {activeTab === "ACTIVITY" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Recent Club Activities</span>
              <div className="flex flex-col gap-2">
                {[
                  { desc: "ALEX donated 5,000 Coins to Club Chest", time: "2h ago" },
                  { desc: "TASAVVUR set Club Privacy status to PUBLIC", time: "4h ago" },
                  { desc: "GUEST MALIK created a Private Ludo room table", time: "5h ago" },
                  { desc: "LUDO KING joined the Club", time: "1d ago" }
                ].map((act, idx) => (
                  <div key={idx} className="bg-purple-950/40 border border-purple-800/20 p-2.5 rounded-2xl flex justify-between text-[10px] text-purple-200">
                    <span>{act.desc}</span>
                    <span className="text-slate-500 font-mono flex-shrink-0">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. SETTINGS */}
          {activeTab === "SETTINGS" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="bg-purple-950/40 border border-purple-800/40 p-4 rounded-3xl flex flex-col gap-3">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Edit Club Information</span>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-purple-300 uppercase">Club Name</span>
                  <input
                    type="text"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-950/80 border border-purple-500/20 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-purple-300 uppercase">Announcement</span>
                  <textarea
                    value={clubAnn}
                    rows={2}
                    onChange={(e) => setClubAnn(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-950/80 border border-purple-500/20 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-purple-300 uppercase">Description</span>
                  <textarea
                    value={clubDesc}
                    rows={2}
                    onChange={(e) => setClubDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-950/80 border border-purple-500/20 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <button onClick={() => triggerToast("Club settings updated successfully!")} className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl">Save Settings</button>
              </div>

              <button onClick={() => triggerToast("Club deleted successfully! ❌")} className="w-full py-3.5 bg-rose-600/10 border border-rose-500/30 text-rose-400 font-black text-xs uppercase rounded-2xl active:scale-95">Delete Club ❌</button>
            </div>
          )}

          {/* 13. MANAGEMENT */}
          {activeTab === "MANAGEMENT" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="bg-purple-950/40 border border-purple-800/40 p-3 rounded-2xl">
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block mb-2">📬 Pending Applications ({joinRequests.length})</span>
                {joinRequests.map(req => (
                  <div key={req.id} className="flex justify-between items-center bg-[#0C0416]/50 border border-purple-900/40 p-2.5 rounded-xl mb-2">
                    <div>
                      <span className="text-xs font-black text-white">{req.name}</span>
                      <span className="text-[8px] text-purple-300 block mt-0.5">Level {req.level} • {req.trophies} Trophies</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setJoinRequests(prev => prev.filter(r => r.id !== req.id));
                          setMembers([...members, { id: req.id, name: req.name, role: "Member", isOnline: false, lastSeen: "Just now", contributions: 0, winRate: "50%", trophies: req.trophies }]);
                          triggerToast(`Accepted ${req.name}!`);
                        }}
                        className="px-2.5 py-1 bg-emerald-500 text-white font-black text-[9px] rounded-lg"
                      >
                        Accept
                      </button>
                      <button onClick={() => { setJoinRequests(prev => prev.filter(r => r.id !== req.id)); triggerToast(`Rejected ${req.name}!`); }} className="px-2.5 py-1 bg-slate-800 text-white font-black text-[9px] rounded-lg">Reject</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-purple-950/40 border border-purple-800/40 p-3.5 rounded-2xl flex flex-col gap-2">
                <span className="text-[10px] font-black text-purple-300 uppercase block mb-1">Threshold Join Limits</span>
                <div className="flex justify-between text-xs text-purple-200">
                  <span>Minimum Trophies Required</span>
                  <span className="text-amber-400 font-mono font-bold">{minTrophiesReq}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={minTrophiesReq}
                  onChange={(e) => setMinTrophiesReq(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div className="bg-purple-950/40 border border-purple-800/40 p-3 rounded-2xl">
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block mb-2">🚫 Ban List</span>
                {banList.map((ban, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 border-b border-purple-850/20 text-xs font-bold">
                    <span>{ban}</span>
                    <button onClick={() => { setBanList(prev => prev.filter(b => b !== ban)); triggerToast(`Unbanned ${ban}!`); }} className="text-rose-400 font-black text-[10px]">UNBAN</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Selected Member Overlay Modal */}
        {selectedMember && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="w-full max-w-[300px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black tracking-widest uppercase text-amber-300">Member Settings</h4>
                <button onClick={() => setSelectedMember(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-950/80 text-amber-200 font-black">✕</button>
              </div>

              <div className="bg-purple-950/50 border border-purple-800/60 rounded-2xl p-3 text-center mb-4">
                <span className="text-sm font-black text-white block">{selectedMember.name}</span>
                <span className="text-[9px] uppercase font-black text-amber-400 block mt-1">{selectedMember.role}</span>
              </div>

              <div className="flex flex-col gap-2">
                {selectedMember.id !== "m1" ? (
                  <>
                    <button onClick={() => handlePromote(selectedMember)} className="py-2 bg-purple-900 border border-purple-500/30 text-purple-200 font-black text-[10px] uppercase rounded-xl">Promote</button>
                    <button onClick={() => handleDemote(selectedMember)} className="py-2 bg-purple-900 border border-purple-500/30 text-purple-200 font-black text-[10px] uppercase rounded-xl">Demote</button>
                    <button onClick={() => handleTransferLeadership(selectedMember)} className="py-2 bg-amber-500/10 border border-amber-400 text-amber-300 font-black text-[10px] uppercase rounded-xl">Transfer Leader 👑</button>
                    <button onClick={() => handleKick(selectedMember)} className="py-2 bg-rose-500/10 border border-rose-500/40 text-rose-400 font-black text-[10px] uppercase rounded-xl">Kick Member 🚪</button>
                  </>
                ) : (
                  <p className="text-[10px] text-purple-400 italic text-center">No actions available on yourself.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toast alerts */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[250] px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-900 border-2 border-amber-400 rounded-xl shadow-lg animate-bounce">
            <span className="text-[9px] font-black text-amber-300 tracking-wider uppercase select-none">✨ {toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
};
