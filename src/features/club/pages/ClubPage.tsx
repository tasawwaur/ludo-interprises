import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import confetti from "canvas-confetti";

interface ClubPageProps {
  onBack?: () => void;
}

type ClubTab = "HOME" | "MEMBERS" | "CHAT" | "TOURNAMENT" | "MANAGE";

interface Member {
  id: string;
  name: string;
  avatar?: string;
  role: "Leader" | "Co-Leader" | "Elder" | "VIP Member" | "Member";
  isOnline: boolean;
  lastSeen?: string;
  contributions: number;
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

  // Club details state
  const [clubName, setClubName] = useState("ROYAL LUXE 🏰");
  const [clubAnn, setClubAnn] = useState("🏆 Let's climb to Top 10 globally! Play daily matches & donate coins.");
  const [clubDesc, setClubDesc] = useState("Premium club for elite Ludo players. Weekly tournaments, active chatting & generous gifting!");
  const [minLevelReq, setMinLevelReq] = useState(10);
  const [clubPrivacy, setClubPrivacy] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  // Members state
  const [members, setMembers] = useState<Member[]>([
    { id: "m1", name: user?.displayName || user?.username || "TASAVVUR", role: "Leader", isOnline: true, contributions: 1200 },
    { id: "m2", name: "GUEST MALIK", role: "Co-Leader", isOnline: true, contributions: 950 },
    { id: "m3", name: "LUDO KING", role: "Elder", isOnline: true, contributions: 620 },
    { id: "m4", name: "ALEX", role: "VIP Member", isOnline: false, lastSeen: "2h ago", contributions: 550 },
    { id: "m5", name: "GUEST 4819", role: "Member", isOnline: false, lastSeen: "1d ago", contributions: 120 },
    { id: "m6", name: "SHIVAM", role: "Member", isOnline: true, contributions: 80 },
    { id: "m7", name: "NEHA 👑", role: "VIP Member", isOnline: false, lastSeen: "30m ago", contributions: 450 },
  ]);

  const [searchMember, setSearchMember] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "c1", senderName: "GUEST MALIK", senderRole: "Co-Leader", content: "Hey guys! Who is up for a Private Match?", timestamp: "8:35 PM" },
    { id: "c2", senderName: "LUDO KING", senderRole: "Elder", content: "Count me in! Create a private table, I'll join.", timestamp: "8:37 PM" },
    { id: "c3", senderName: "ALEX", senderRole: "VIP Member", content: "I'll spectate! Let's see who wins today.", timestamp: "8:40 PM" }
  ]);
  const [inputText, setInputText] = useState("");
  const [replyMessage, setReplyMessage] = useState<ChatMessage | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Pinned message
  const [pinnedMessage, setPinnedMessage] = useState<string>("📌 Sunday Club Championship at 9:00 PM! Cash reward pool of ₹5,000 + 10,000 Coins!");

  // Join Requests / Applications
  const [joinRequests, setJoinRequests] = useState([
    { id: "req1", name: "RAHUL_YT", level: 18, trophies: 2300 },
    { id: "req2", name: "SIMRAN_88", level: 14, trophies: 1950 },
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { action: "GUEST MALIK promoted ALEX to VIP Member", time: "2h ago" },
    { action: "TASAVVUR updated Club Announcement", time: "4h ago" },
    { action: "LUDO KING donated 5,000 Coins to Club Chest", time: "6h ago" },
  ]);

  // Contribution Chest
  const [clubChestCoins, setClubChestCoins] = useState(45000);
  const [clubChestGems, setClubChestGems] = useState(150);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "CHAT") {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  // Chat Handlers
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

  const handleSendGift = (type: "COINS" | "GEMS", amount: number) => {
    // Check if user has enough currency
    const userCoins = user?.coins || 0;
    const userGems = user?.gems || 0;

    if (type === "COINS" && userCoins < amount) {
      triggerToast("❌ Insufficient Coins to send this gift!");
      return;
    }
    if (type === "GEMS" && userGems < amount) {
      triggerToast("❌ Insufficient Gems to send this gift!");
      return;
    }

    // Deduct user balance
    if (type === "COINS") {
      updateUser({ coins: userCoins - amount });
    } else {
      updateUser({ gems: userGems - amount });
    }

    confetti({ particleCount: 60, spread: 80, colors: ['#E0B0FF', '#DA70D6', '#8A2BE2'] });

    // Add gift message to chat
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
    triggerToast(`🎁 Gift of ${amount.toLocaleString()} ${type} sent to Club!`);
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

    // Remove claimable option locally from this message by editing it
    setChatMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: `🎁 Gift Claimed! +${msg.giftAmount} ${msg.giftType}` } : m));
    confetti({ particleCount: 30, spread: 40 });
  };

  // Member Action Handlers
  const handlePromote = (m: Member) => {
    const rolesOrder: Member["role"][] = ["Member", "VIP Member", "Elder", "Co-Leader", "Leader"];
    const currentIndex = rolesOrder.indexOf(m.role);
    if (currentIndex < rolesOrder.length - 2) {
      const nextRole = rolesOrder[currentIndex + 1];
      setMembers(prev => prev.map(item => item.id === m.id ? { ...item, role: nextRole } : item));
      setAuditLogs([{ action: `TASAVVUR promoted ${m.name} to ${nextRole}`, time: "Just now" }, ...auditLogs]);
      triggerToast(`Promoted ${m.name} to ${nextRole}!`);
      setSelectedMember(null);
    } else {
      triggerToast("Cannot promote further! Transfer leadership if needed.");
    }
  };

  const handleDemote = (m: Member) => {
    const rolesOrder: Member["role"][] = ["Member", "VIP Member", "Elder", "Co-Leader", "Leader"];
    const currentIndex = rolesOrder.indexOf(m.role);
    if (currentIndex > 0 && m.role !== "Leader") {
      const prevRole = rolesOrder[currentIndex - 1];
      setMembers(prev => prev.map(item => item.id === m.id ? { ...item, role: prevRole } : item));
      setAuditLogs([{ action: `TASAVVUR demoted ${m.name} to ${prevRole}`, time: "Just now" }, ...auditLogs]);
      triggerToast(`Demoted ${m.name} to ${prevRole}!`);
      setSelectedMember(null);
    } else {
      triggerToast("Cannot demote further!");
    }
  };

  const handleKick = (m: Member) => {
    if (m.role === "Leader") {
      triggerToast("You cannot kick yourself!");
      return;
    }
    setMembers(prev => prev.filter(item => item.id !== m.id));
    setAuditLogs([{ action: `TASAVVUR kicked ${m.name} from Club`, time: "Just now" }, ...auditLogs]);
    triggerToast(`Kicked ${m.name} from Club! 🚪`);
    setSelectedMember(null);
  };

  const handleTransferLeadership = (m: Member) => {
    if (m.id === "m1") return;
    setMembers(prev => prev.map(item => {
      if (item.id === "m1") return { ...item, role: "Co-Leader" as const };
      if (item.id === m.id) return { ...item, role: "Leader" as const };
      return item;
    }));
    setAuditLogs([{ action: `TASAVVUR transferred leadership to ${m.name}`, time: "Just now" }, ...auditLogs]);
    triggerToast(`Leadership transferred to ${m.name}! 👑`);
    setSelectedMember(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* Dynamic Background */}
      <LudoPageBackground variant="shop" />

      {/* Main Container constrained to Mobile/App Viewport */}
      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 overflow-hidden">
        
        {/* ── LUXURY TOP BAR / HEADER ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-purple-500/10 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-lg hover:bg-black/70 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-black tracking-widest bg-gradient-to-r from-purple-200 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent uppercase glow-purple-text flex items-center gap-1.5 leading-none">
              🏰 CLUB MANIA
            </h1>
            <span className="text-[9px] font-bold text-purple-300/80 mt-1">ID: #987621 • Lv. 15</span>
          </div>

          {/* Quick Balance indicator */}
          <div className="flex items-center gap-1 bg-black/60 border border-purple-500/30 px-2.5 py-1 rounded-full shadow-inner">
            <img src="/assets/images/icons/icon_gem.png" className="w-[12px] h-[12px] object-contain" alt="Crowns" />
            <span className="text-[10px] font-black text-purple-300 font-mono">
              {(user?.crowns ?? 2).toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── TAB CONTENT SCROLLABLE AREA ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 pb-20">
          
          {/* ======================================= */}
          {/*             HOME TAB VIEW               */}
          {/* ======================================= */}
          {activeTab === "HOME" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
              
              {/* Club Luxury Banner Card */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl p-4 flex flex-col justify-end min-h-[140px] bg-gradient-to-b from-[#35105E]/40 via-[#1C0537]/80 to-[#0F0220]">
                {/* Banner Deco Graphic */}
                <div className="absolute inset-0 bg-[url('/assets/images/board_classic.png')] bg-cover opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full border border-yellow-300 shadow">
                  RANK #12
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                  {/* Golden Shield Logo */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-rose-600 p-[2px] shadow-lg flex-shrink-0 flex items-center justify-center">
                    <div className="w-full h-full bg-[#1C0830] rounded-[14px] flex items-center justify-center">
                      <span className="text-3xl">🏰</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-black text-white leading-tight flex items-center gap-1.5">
                      {clubName}
                    </h2>
                    <p className="text-[10px] text-amber-300 font-bold tracking-wide">Elite Royal League</p>
                  </div>
                </div>
              </div>

              {/* Members Status Panel */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-md">
                  <span className="text-xl">👥</span>
                  <span className="text-xs font-bold text-purple-200 mt-1">Club Members</span>
                  <span className="text-lg font-black text-white mt-0.5">{members.length} / 30</span>
                </div>
                <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-md">
                  <span className="text-xl">🟢</span>
                  <span className="text-xs font-bold text-purple-200 mt-1">Online Now</span>
                  <span className="text-lg font-black text-emerald-400 mt-0.5">
                    {members.filter(m => m.isOnline).length} Active
                  </span>
                </div>
              </div>

              {/* Club Chest / Donation Card */}
              <div className="bg-gradient-to-br from-[#2D124D] to-[#160627] border-2 border-purple-500/20 rounded-3xl p-4 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🎁</span>
                    <span className="text-xs font-black uppercase text-purple-200 tracking-wider">Club Chest level 5</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-black">CLAIMABLE IN 2D</span>
                </div>
                {/* Chest visual */}
                <div className="flex items-center gap-4 bg-black/40 border border-purple-800/40 rounded-2xl p-3 mb-3">
                  <img src="/assets/images/icons/luxury_chest.png" className="w-[50px] h-[50px] object-contain drop-shadow-md animate-bounce" alt="Chest" />
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-purple-300 font-bold">Progress (Coins)</span>
                      <span className="text-amber-400 font-mono font-black">{clubChestCoins.toLocaleString()} / 100K</span>
                    </div>
                    <div className="w-full h-2.5 bg-purple-950 rounded-full border border-purple-900 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" style={{ width: `${(clubChestCoins/100000)*100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      const userCoins = user?.coins || 0;
                      if (userCoins < 5000) {
                        triggerToast("❌ Insufficient Coins to Donate!");
                        return;
                      }
                      updateUser({ coins: userCoins - 5000 });
                      setClubChestCoins(prev => prev + 5000);
                      triggerToast("🪙 Donated 5,000 Coins to Club Chest!");
                      confetti({ particleCount: 20 });
                    }}
                    className="py-2 rounded-xl bg-purple-900/60 border border-purple-500/30 text-amber-300 font-black text-[10px] uppercase hover:bg-purple-800 transition-all active:scale-95"
                  >
                    Donate 5K Coins
                  </button>
                  <button 
                    onClick={() => {
                      const userGems = user?.gems || 0;
                      if (userGems < 50) {
                        triggerToast("❌ Insufficient Gems to Donate!");
                        return;
                      }
                      updateUser({ gems: userGems - 50 });
                      setClubChestGems(prev => prev + 50);
                      triggerToast("💎 Donated 50 Gems to Club Chest!");
                      confetti({ particleCount: 20 });
                    }}
                    className="py-2 rounded-xl bg-purple-900/60 border border-purple-500/30 text-blue-300 font-black text-[10px] uppercase hover:bg-purple-800 transition-all active:scale-95"
                  >
                    Donate 50 Gems
                  </button>
                </div>
              </div>

              {/* Announcement marquee board */}
              <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 flex flex-col gap-1.5 shadow-md">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">📢 Club Announcement</span>
                <p className="text-xs text-purple-200 font-medium leading-relaxed italic">"{clubAnn}"</p>
              </div>

              {/* Description board */}
              <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 flex flex-col gap-1.5 shadow-md">
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">ℹ️ Club Description</span>
                <p className="text-xs text-purple-300/90 leading-relaxed font-medium">"{clubDesc}"</p>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/*             MEMBERS TAB VIEW            */}
          {/* ======================================= */}
          {activeTab === "MEMBERS" && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-250">
              
              {/* Search Member input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search Member..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full py-2 pl-9 pr-4 bg-purple-950/60 border border-purple-500/20 rounded-xl text-xs placeholder:opacity-50 text-white font-bold focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Members List */}
              <div className="flex flex-col gap-2">
                {members
                  .filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase()))
                  .map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="flex items-center justify-between p-3 rounded-2xl border bg-purple-950/40 border-purple-850/40 hover:border-purple-500/30 cursor-pointer active:scale-[0.99] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar frame */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-purple-800 to-indigo-900 border border-purple-500/20 flex items-center justify-center text-sm font-black relative flex-shrink-0">
                          {m.avatar ? (
                            <img src={m.avatar} alt={m.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span>{m.name.charAt(0).toUpperCase()}</span>
                          )}
                          {/* Online status indicator */}
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#12061F] ${m.isOnline ? "bg-emerald-400 shadow-[0_0_6px_#10B981]" : "bg-slate-500"}`}></span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black tracking-wide text-white group-hover:text-amber-200 transition-colors">{m.name}</span>
                            
                            {/* Role Tag badge */}
                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${
                              m.role === 'Leader' 
                                ? 'bg-gradient-to-r from-red-500 to-rose-600 border-red-300 text-white shadow'
                                : m.role === 'Co-Leader'
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-200 text-slate-950 shadow'
                                : m.role === 'Elder'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-400 text-white shadow'
                                : m.role === 'VIP Member'
                                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-700 border-purple-400 text-white shadow'
                                : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}>
                              {m.role}
                            </span>
                          </div>
                          <span className="text-[8px] text-purple-300 font-bold block mt-0.5">Contribution: {m.contributions} XP</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400">
                          {m.isOnline ? (
                            <span className="text-emerald-400 font-black animate-pulse uppercase tracking-widest text-[8px]">Active</span>
                          ) : (
                            m.lastSeen || "Offline"
                          )}
                        </span>
                        <span className="text-[8px] text-purple-400 mt-1 font-bold">Options ⚙️</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/*             CHAT TAB VIEW               */}
          {/* ======================================= */}
          {activeTab === "CHAT" && (
            <div className="flex flex-col h-[calc(100vh-190px)] animate-in fade-in duration-250 justify-between">
              
              {/* Pinned message header */}
              {pinnedMessage && (
                <div className="bg-purple-950/80 border border-amber-500/20 rounded-2xl p-2.5 mb-2 relative flex items-center justify-between">
                  <p className="text-[10px] font-bold text-amber-300 flex-1 truncate pr-2">{pinnedMessage}</p>
                  <button 
                    onClick={() => setPinnedMessage("")} 
                    className="text-amber-200 font-black text-xs hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Chat Board */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 p-1.5">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="flex flex-col gap-1">
                    {/* Reply quote indicator */}
                    {msg.replyTo && (
                      <span className="text-[8px] text-purple-300/70 italic ml-11 flex items-center gap-1">
                        ↩️ Replying to: "{msg.replyTo}"
                      </span>
                    )}

                    <div className="flex items-start gap-2.5">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-purple-900 border border-purple-500/10 flex items-center justify-center text-xs font-black relative flex-shrink-0">
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] font-black text-purple-200">{msg.senderName}</span>
                          <span className="text-[7px] text-purple-400/90 font-bold">{msg.senderRole}</span>
                          <span className="text-[7px] text-slate-500 font-medium font-mono">{msg.timestamp}</span>
                        </div>

                        {/* Gift layout */}
                        {msg.isGift ? (
                          <div className="bg-gradient-to-r from-purple-800 to-indigo-900 border border-amber-400 p-3 rounded-2xl mt-1.5 flex flex-col items-center gap-2 max-w-[200px] shadow-lg animate-pulse">
                            <span className="text-xl">🎁 CLUB GIFT</span>
                            <span className="text-[11px] font-black text-amber-300 font-mono tracking-wider">
                              {msg.giftAmount?.toLocaleString()} {msg.giftType}
                            </span>
                            {/* Check if it's already claimed */}
                            {msg.content.includes("Claimed") ? (
                              <span className="text-[8px] text-emerald-300 uppercase tracking-widest font-black">CLAIMED</span>
                            ) : (
                              <button
                                onClick={() => handleClaimGift(msg)}
                                className="w-full py-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] rounded-lg border border-yellow-200 hover:brightness-110 active:scale-95"
                              >
                                CLAIM GIFT
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-purple-950/40 border border-purple-800/20 p-2.5 rounded-2xl rounded-tl-none mt-1 text-xs text-white max-w-[90%] font-medium break-all">
                            {msg.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>

              {/* Chat Inputs Footer */}
              <div className="flex flex-col gap-2 bg-black/40 border-t border-purple-500/10 p-2 relative">
                
                {/* Reply Indicator Bar */}
                {replyMessage && (
                  <div className="flex justify-between items-center bg-purple-950/80 border border-purple-500/30 px-3 py-1.5 rounded-xl mb-1 text-[9px]">
                    <span className="text-purple-300 font-bold">Replying to {replyMessage.senderName}: "{replyMessage.content}"</span>
                    <button onClick={() => setReplyMessage(null)} className="text-white hover:text-red-400">✕</button>
                  </div>
                )}

                {/* Stickers Draw Drawer */}
                {showStickers && (
                  <div className="absolute bottom-[105%] left-2 right-2 bg-[#1C0A33] border-2 border-purple-500/40 p-3 rounded-2xl shadow-2xl flex flex-col gap-2 z-50">
                    <span className="text-[9px] font-black text-purple-300 uppercase tracking-wider">Club Emojis & Gifts</span>
                    <div className="grid grid-cols-5 gap-2 text-center text-xl">
                      {["🔥", "🔥", "👑", "🏰", "🍀"].map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInputText(prev => prev + emoji);
                            setShowStickers(false);
                          }}
                          className="py-1.5 hover:bg-purple-900 rounded-lg active:scale-90"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    {/* Generous Gift sender */}
                    <div className="border-t border-purple-800/40 pt-2 flex flex-col gap-1.5">
                      <span className="text-[8px] font-black text-amber-400 uppercase tracking-wide">Share Gift with Members</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            handleSendGift("COINS", 5000);
                            setShowStickers(false);
                          }}
                          className="py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-[9px] rounded-lg hover:bg-amber-500/20 active:scale-95"
                        >
                          🎁 Send 5K Coins
                        </button>
                        <button
                          onClick={() => {
                            handleSendGift("GEMS", 50);
                            setShowStickers(false);
                          }}
                          className="py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black text-[9px] rounded-lg hover:bg-blue-500/20 active:scale-95"
                        >
                          🎁 Send 50 Gems
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowStickers(!showStickers)}
                    className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/20 flex items-center justify-center text-lg hover:bg-purple-800 transition-colors cursor-pointer"
                  >
                    🎁
                  </button>
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                    className="flex-1 px-4 bg-purple-950/60 border border-purple-500/20 rounded-xl text-xs placeholder:opacity-40 text-white font-bold focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 bg-gradient-to-r from-purple-500 via-fuchsia-600 to-indigo-600 rounded-xl font-black text-xs uppercase tracking-wide shadow-md active:scale-95 transition-all cursor-pointer border-0 outline-none"
                  >
                    Send
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/*             TOURNAMENT TAB VIEW         */}
          {/* ======================================= */}
          {activeTab === "TOURNAMENT" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
              
              {/* Main Banner */}
              <div className="bg-gradient-to-br from-[#2D124D] to-[#160627] border-2 border-amber-500/40 rounded-3xl p-4 shadow-xl text-center">
                <span className="text-xl">🏆</span>
                <h3 className="text-sm font-black text-amber-200 tracking-wider uppercase mt-1">Club League Season 4</h3>
                <p className="text-[10px] text-purple-300 mt-1 italic">Play Arena matches & earn League Points!</p>
                <div className="w-full h-[1px] bg-purple-800/40 my-3"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-purple-400 font-bold">Prize Pool</span>
                    <span className="text-xs font-black text-amber-300">50K Coins</span>
                  </div>
                  <div className="flex flex-col border-x border-purple-800/40">
                    <span className="text-[9px] text-purple-400 font-bold">Rank</span>
                    <span className="text-xs font-black text-white">#12 / 100</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-purple-400 font-bold">Points</span>
                    <span className="text-xs font-black text-emerald-400">1,820 LP</span>
                  </div>
                </div>
              </div>

              {/* Tournament lists */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Active Leagues</span>
                
                {/* Live Match */}
                <div className="flex justify-between items-center bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-3.5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981] animate-ping"></span>
                      <span className="text-xs font-black text-white">LUDO MASTER LIVE</span>
                    </div>
                    <span className="text-[9px] text-purple-300 font-bold mt-1">TASAVVUR vs OP_KING</span>
                  </div>
                  <button
                    onClick={() => triggerToast("Connecting to live match stream... 🎮")}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[9px] rounded-xl border border-emerald-300 shadow active:scale-95 transition-all"
                  >
                    SPECTATE
                  </button>
                </div>

                {/* Upcoming Match */}
                <div className="flex justify-between items-center bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase">Weekly Elite Cup</span>
                    <span className="text-[9px] text-amber-400/80 font-bold mt-1">Starts in: 04h 15m</span>
                  </div>
                  <button
                    onClick={() => triggerToast("Registered for Weekly Elite Cup! 🏆")}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] rounded-xl border border-yellow-200 shadow active:scale-95 transition-all"
                  >
                    REGISTER
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/*             MANAGE TAB VIEW             */}
          {/* ======================================= */}
          {activeTab === "MANAGE" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
              
              {/* Join Requests section */}
              <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 shadow-md flex flex-col gap-2">
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">📬 Join Requests ({joinRequests.length})</span>
                {joinRequests.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {joinRequests.map(req => (
                      <div key={req.id} className="flex justify-between items-center bg-[#0C0416]/50 border border-purple-900/40 p-2.5 rounded-xl">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-white">{req.name}</span>
                          <span className="text-[8px] text-purple-300 font-bold mt-0.5">Lv. {req.level} • {req.trophies} Trophies</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setJoinRequests(prev => prev.filter(r => r.id !== req.id));
                              triggerToast(`Accepted ${req.name}!`);
                              setMembers([...members, { id: req.id, name: req.name, role: "Member", isOnline: false, lastSeen: "Just now", contributions: 0 }]);
                            }}
                            className="px-2.5 py-1 bg-emerald-500 text-white font-black text-[9px] rounded-lg border border-emerald-300 active:scale-95"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setJoinRequests(prev => prev.filter(r => r.id !== req.id));
                              triggerToast(`Rejected ${req.name}!`);
                            }}
                            className="px-2.5 py-1 bg-slate-800 text-white font-black text-[9px] rounded-lg border border-slate-700 active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-purple-400 italic text-center py-2">No pending join requests.</p>
                )}
              </div>

              {/* Club Settings controls */}
              <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-4 shadow-md flex flex-col gap-3">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">⚙️ Club Settings</span>
                
                {/* Min level slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-purple-200">
                    <span>Minimum Level Required</span>
                    <span className="text-amber-300">Lv. {minLevelReq}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={minLevelReq}
                    onChange={(e) => setMinLevelReq(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                {/* Privacy toggle */}
                <div className="flex justify-between items-center py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-purple-200">Club Privacy</span>
                    <span className="text-[9px] text-purple-400 font-medium">Auto-accept vs invite only</span>
                  </div>
                  <button
                    onClick={() => setClubPrivacy(prev => prev === "PUBLIC" ? "PRIVATE" : "PUBLIC")}
                    className={`px-3 py-1.5 text-[9px] font-black rounded-xl border tracking-widest ${
                      clubPrivacy === "PUBLIC"
                        ? "bg-emerald-500/10 border-emerald-400 text-emerald-400"
                        : "bg-amber-500/10 border-amber-400 text-amber-400"
                    }`}
                  >
                    {clubPrivacy}
                  </button>
                </div>
              </div>

              {/* Audit Logs list */}
              <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-3 shadow-md flex flex-col gap-2">
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">📈 Audit Log</span>
                <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto no-scrollbar">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="flex justify-between text-[9px] font-bold text-purple-300 bg-[#0C0416]/30 border border-purple-900/20 p-2 rounded-xl">
                      <span>{log.action}</span>
                      <span className="text-slate-500 font-mono flex-shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ======================================= */}
        {/*           MEMBERS ACTION OVERLAY        */}
        {/* ======================================= */}
        {selectedMember && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="w-full max-w-[300px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black tracking-widest uppercase text-amber-300">Member Controls</h4>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-950/80 border border-amber-500/30 text-amber-200 font-black hover:bg-purple-900 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Info panel */}
              <div className="bg-purple-950/50 border border-purple-800/60 rounded-2xl p-3 text-center mb-4">
                <span className="text-sm font-black text-white">{selectedMember.name}</span>
                <span className="text-[9px] uppercase font-black text-amber-400 block mt-1">{selectedMember.role}</span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {/* Hide promote/demote/kick buttons if self is leader and target is leader */}
                {selectedMember.id !== "m1" && (
                  <>
                    <button
                      onClick={() => handlePromote(selectedMember)}
                      className="py-2.5 rounded-xl bg-purple-900/60 border border-purple-500/30 text-purple-200 font-black text-[10px] uppercase hover:bg-purple-800 transition-all"
                    >
                      Promote Role
                    </button>
                    <button
                      onClick={() => handleDemote(selectedMember)}
                      className="py-2.5 rounded-xl bg-purple-900/60 border border-purple-500/30 text-purple-200 font-black text-[10px] uppercase hover:bg-purple-800 transition-all"
                    >
                      Demote Role
                    </button>
                    <button
                      onClick={() => handleTransferLeadership(selectedMember)}
                      className="py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-300 font-black text-[10px] uppercase hover:bg-amber-500/20 transition-all"
                    >
                      Transfer Leadership 👑
                    </button>
                    <button
                      onClick={() => handleKick(selectedMember)}
                      className="py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 font-black text-[10px] uppercase hover:bg-rose-500/20 transition-all"
                    >
                      Kick Member 🚪
                    </button>
                  </>
                )}
                {selectedMember.id === "m1" && (
                  <p className="text-[10px] text-purple-400 italic text-center">You cannot perform actions on yourself.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TOAST MESSAGES ── */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[250] px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-900 border-2 border-amber-400 rounded-xl shadow-lg animate-bounce">
            <span className="text-[9px] font-black text-amber-300 tracking-wider uppercase">
              ✨ {toastMessage}
            </span>
          </div>
        )}

        {/* ── BOTTON NAVIGATION (CLUB TABS) ── */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#0E031E] border-t border-purple-500/10 flex justify-between items-center px-4 z-40">
          
          <button
            onClick={() => setActiveTab("HOME")}
            className={`flex flex-col items-center justify-center flex-1 h-full border-0 outline-none bg-transparent cursor-pointer transition-all ${activeTab === "HOME" ? "text-amber-400 scale-105 font-bold" : "text-purple-300/60"}`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-lg">🏠</span>
            <span className="text-[8px] mt-1 font-black uppercase tracking-wider">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("MEMBERS")}
            className={`flex flex-col items-center justify-center flex-1 h-full border-0 outline-none bg-transparent cursor-pointer transition-all ${activeTab === "MEMBERS" ? "text-amber-400 scale-105 font-bold" : "text-purple-300/60"}`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-lg">👥</span>
            <span className="text-[8px] mt-1 font-black uppercase tracking-wider">Members</span>
          </button>

          <button
            onClick={() => setActiveTab("CHAT")}
            className={`flex flex-col items-center justify-center flex-1 h-full border-0 outline-none bg-transparent cursor-pointer transition-all ${activeTab === "CHAT" ? "text-amber-400 scale-105 font-bold" : "text-purple-300/60"}`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-lg">💬</span>
            <span className="text-[8px] mt-1 font-black uppercase tracking-wider">Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("TOURNAMENT")}
            className={`flex flex-col items-center justify-center flex-1 h-full border-0 outline-none bg-transparent cursor-pointer transition-all ${activeTab === "TOURNAMENT" ? "text-amber-400 scale-105 font-bold" : "text-purple-300/60"}`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-lg">🏆</span>
            <span className="text-[8px] mt-1 font-black uppercase tracking-wider">League</span>
          </button>

          <button
            onClick={() => setActiveTab("MANAGE")}
            className={`flex flex-col items-center justify-center flex-1 h-full border-0 outline-none bg-transparent cursor-pointer transition-all ${activeTab === "MANAGE" ? "text-amber-400 scale-105 font-bold" : "text-purple-300/60"}`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[8px] mt-1 font-black uppercase tracking-wider">Manage</span>
          </button>

        </div>

      </div>
    </div>
  );
};
