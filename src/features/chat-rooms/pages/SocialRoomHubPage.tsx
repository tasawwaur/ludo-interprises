import React, { useState, useEffect, useRef } from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { useUserStore } from '../../../user/user.store';
import confetti from 'canvas-confetti';

interface SocialRoomHubPageProps {
  onBack?: () => void;
}

interface Room {
  id: string;
  name: string;
  host: string;
  type: 'VIP Lounge' | 'Casual Chat' | 'Music & Chill' | 'Elite Ludo';
  country: string;
  flag: string;
  minVipRank: 'None' | 'Gold' | 'Diamond' | 'Legendary';
  onlineCount: number;
  betAmount: number;
}

interface RoomChatMessage {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  giftedAmount?: number;
  isSystem?: boolean;
}

const INITIAL_ROOMS: Room[] = [
  { id: 'room_1', name: 'Dubai Sheikhs Palace 👑', host: 'Sheikh_Hamdan', type: 'VIP Lounge', country: 'UAE', flag: '🇦🇪', minVipRank: 'Diamond', onlineCount: 14, betAmount: 100000 },
  { id: 'room_2', name: 'Mumbai Ludo Club 🏆', host: 'Ludo_King_99', type: 'Elite Ludo', country: 'India', flag: '🇮🇳', minVipRank: 'Gold', onlineCount: 8, betAmount: 10000 },
  { id: 'room_3', name: 'Las Vegas High Rollers 🎲', host: 'Vegas_Jackpot', type: 'VIP Lounge', country: 'USA', flag: '🇺🇸', minVipRank: 'Legendary', onlineCount: 21, betAmount: 50000 },
  { id: 'room_4', name: 'Saudi Elite Lounge 🕌', host: 'Al_Saud_Prince', type: 'VIP Lounge', country: 'Saudi Arabia', flag: '🇸🇦', minVipRank: 'Diamond', onlineCount: 6, betAmount: 200000 },
  { id: 'room_5', name: 'Brazil Samba & Ludo 🎵', host: 'Neymar_Fan', type: 'Music & Chill', country: 'Brazil', flag: '🇧🇷', minVipRank: 'None', onlineCount: 11, betAmount: 5000 },
  { id: 'room_6', name: 'London Royal Kings 🇬🇧', host: 'Sir_Arthur', type: 'Elite Ludo', country: 'UK', flag: '🇬🇧', minVipRank: 'Gold', onlineCount: 9, betAmount: 25000 },
  { id: 'room_7', name: 'Sydney Chill Out Room 🦘', host: 'Aussie_Roll', type: 'Casual Chat', country: 'Australia', flag: '🇦🇺', minVipRank: 'None', onlineCount: 5, betAmount: 2000 },
  { id: 'room_8', name: 'Tokyo Neon Arcade 🗼', host: 'Otaku_Ludo', type: 'Music & Chill', country: 'Japan', flag: '🇯🇵', minVipRank: 'None', onlineCount: 12, betAmount: 8000 },
];

const BOT_MESSAGES = [
  'Hey guys! Who wants to play high-stakes next?',
  'Send some coins if you are feeling generous today! 🎁',
  'Welcome to the room everyone! Turn on your mics.',
  'Ludo is all about strategy and a bit of luck.',
  'Thanks for the coins brother! Appreciated.',
  'Dubai rooms are always high stakes!',
];

export const SocialRoomHubPage: React.FC<SocialRoomHubPageProps> = ({ onBack }) => {
  const userStore = useUserStore();
  const user = userStore.user;

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  // Active Chat states
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [talkingBot, setTalkingBot] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState<string | null>(null); // target member name

  // Create Room fields
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<Room['type']>('Casual Chat');
  const [newRoomCountry, setNewRoomCountry] = useState('India');
  const [newRoomMinVip, setNewRoomMinVip] = useState<Room['minVipRank']>('None');
  const [newRoomBet, setNewRoomBet] = useState(5000);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new chat message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate bot talking indicators and automated messages
  useEffect(() => {
    if (!activeRoom) return;

    // Simulate bot talking indicators
    const talkingInterval = setInterval(() => {
      const bots = ['Lucifer', 'Angel', 'Sultan', 'Queen', 'Odin'];
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      setTalkingBot(randomBot);
      setTimeout(() => setTalkingBot(null), 3000);
    }, 8000);

    // Simulate bots posting chat messages
    const chatInterval = setInterval(() => {
      const bots = ['𓆩𝐋𝐮𝐜𝐢𝐟𝐞𝐫𓆪', '꧁༺𝐀𝐧𝐠𝐞𝐥༻꧂', 'Sultan', 'Queen', 'Odin'];
      const botName = bots[Math.floor(Math.random() * bots.length)];
      const msg = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];

      setChatMessages((prev) => [
        ...prev,
        {
          id: 'bot_msg_' + Date.now(),
          sender: botName,
          avatar: '/assets/images/icons/icon_club_crown.png',
          content: msg,
        },
      ]);
    }, 12000);

    return () => {
      clearInterval(talkingInterval);
      clearInterval(chatInterval);
    };
  }, [activeRoom]);

  // Handle Room Join
  const handleJoinRoom = (room: Room) => {
    setActiveRoom(room);
    setIsMicOn(false);
    // Load default greeting messages
    setChatMessages([
      { id: 'sys_1', sender: 'System', avatar: '', content: `Welcome to ${room.name}! Feel free to chat publicly, use mic, and send gifts.`, isSystem: true },
      { id: 'init_1', sender: room.host, avatar: '/assets/images/icons/icon_club_crown.png', content: `Welcome to my room! Let's have fun. 🎤 Mic is active!` },
    ]);
  };

  // Handle Room Creation
  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      alert('Please enter a room name!');
      return;
    }

    const newRoomId = 'custom_room_' + Date.now();
    const flags: Record<string, string> = { India: '🇮🇳', UAE: '🇦🇪', USA: '🇺🇸', Brazil: '🇧🇷', UK: '🇬🇧' };
    
    const newCreatedRoom: Room = {
      id: newRoomId,
      name: newRoomName,
      host: user?.displayName || user?.username || 'TASAVVUR',
      type: newRoomType,
      country: newRoomCountry,
      flag: flags[newRoomCountry] || '🌐',
      minVipRank: newRoomMinVip,
      onlineCount: 1,
      betAmount: newRoomBet,
    };

    setRooms([newCreatedRoom, ...rooms]);
    setShowCreateModal(false);
    handleJoinRoom(newCreatedRoom);

    // reset fields
    setNewRoomName('');
  };

  // Handle Send Chat Message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const myMessage: RoomChatMessage = {
      id: 'msg_' + Date.now(),
      sender: user?.displayName || user?.username || 'TASAVVUR',
      avatar: user?.avatar || '/assets/images/icons/icon_club_crown.png',
      content: inputText,
    };

    setChatMessages((prev) => [...prev, myMessage]);
    setInputText('');
  };

  // Gift Coins to Member
  const handleSendGift = (amount: number) => {
    if (!user) return;
    if (user.coins < amount) {
      alert('Insufficient Coins to send gift!');
      return;
    }

    // Deduct coins
    userStore.updateUser({ coins: user.coins - amount });

    // Close Modal
    const receiver = showGiftModal || 'Everyone';
    setShowGiftModal(null);

    // Trigger Confetti
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#FFD700', '#FFA500', '#FF3D57'],
    });

    // Add system notification message
    const giftMessage: RoomChatMessage = {
      id: 'gift_' + Date.now(),
      sender: 'System',
      avatar: '',
      content: `🎁 ${user?.displayName || user?.username || 'TASAVVUR'} gifted 🪙 ${amount.toLocaleString()} Coins to ${receiver}! 🎉`,
      giftedAmount: amount,
      isSystem: true,
    };

    setChatMessages((prev) => [...prev, giftMessage]);
  };

  // Filter Rooms by search query
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#0F041C] text-white flex flex-col items-center relative overflow-hidden select-none font-sans pb-10">
      <LudoPageBackground variant="home" />

      {/* Main Container */}
      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-4 py-4">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={() => {
              if (activeRoom) {
                setActiveRoom(null);
              } else {
                onBack?.();
              }
            }}
            className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            ❮
          </button>
          <h1 className="text-base font-black tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent uppercase glow-amber-text">
            {activeRoom ? `${activeRoom.flag} ${activeRoom.name}` : 'GLOBAL SOCIAL ROOMS'}
          </h1>
          <div className="w-10 h-10"></div>
        </div>

        {/* VIEW 1: ROOM LIST HUB */}
        {!activeRoom && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Buttons Row */}
            <div className="flex gap-2.5 mb-4 flex-shrink-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-2xl border-0 uppercase hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-yellow-500/20"
              >
                ➕ Create Room
              </button>
              
              <button
                onClick={() => {
                  const rand = rooms[Math.floor(Math.random() * rooms.length)];
                  handleJoinRoom(rand);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs rounded-2xl border-0 uppercase hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-purple-500/20"
              >
                ⚡ Join Random
              </button>
            </div>

            {/* Search Input bar */}
            <div className="relative mb-4 flex-shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search rooms by name, country, or type..."
                className="w-full bg-slate-950/70 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 outline-none focus:border-amber-400/50 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Scrollable Room List */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-24">
              {filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-950/30 rounded-2xl border border-white/5 mt-10">
                  <span className="text-3xl mb-2">🔎</span>
                  <p className="text-xs text-slate-400 font-bold">No social rooms matching your search.</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="relative rounded-3xl border border-white/10 bg-slate-950/50 p-4 flex items-center justify-between gap-4 backdrop-blur-md shadow-lg shadow-black/10 hover:border-amber-400/30 transition-all"
                  >
                    {/* Room main details */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#35105E]/80 to-[#100222] border border-purple-500/30 flex items-center justify-center text-2xl shadow">
                        {room.type === 'VIP Lounge' ? '👑' : room.type === 'Elite Ludo' ? '🏆' : '💬'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-black text-white truncate max-w-[170px]">
                            {room.name}
                          </span>
                          <span className="text-[12px]" title={room.country}>
                            {room.flag}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-purple-300 mt-0.5 uppercase tracking-wide">
                          {room.type} • {room.onlineCount} Online
                        </p>
                        
                        {/* Tags list */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[8px] font-black bg-purple-900/40 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md">
                            VIP: {room.minVipRank}
                          </span>
                          <span className="text-[8px] font-black bg-amber-900/30 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            🪙 {room.betAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={() => handleJoinRoom(room)}
                      className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 border-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE CHAT ROOM SCREEN */}
        {activeRoom && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* 1. ROOM STATS BAR & MEMBERS MICROPHONES */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 flex flex-col gap-3 mb-3 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="font-black text-amber-300 uppercase tracking-widest text-[10px]">
                  🎙️ Active Voice Room (Mic / Talk)
                </span>
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5">
                  🟢 {activeRoom.onlineCount} Online • Bet Bet: 🪙 {activeRoom.betAmount.toLocaleString()}
                </span>
              </div>

              {/* Members Voice Bubbles Grid */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {/* User Voice bubble */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 relative">
                  <div className={`w-11 h-11 rounded-full p-[2px] shadow-md flex items-center justify-center ${
                    isMicOn ? 'bg-gradient-to-br from-cyan-400 to-blue-500 animate-pulse' : 'bg-slate-800'
                  }`}>
                    <div className="w-full h-full bg-[#1A0C2E] rounded-full flex items-center justify-center text-xs font-black text-white relative">
                      👤
                      {isMicOn && (
                        <span className="absolute bottom-0 right-0 bg-cyan-400 text-[6px] text-slate-950 font-black rounded-full px-1 py-0.5 leading-none shadow">
                          TALK
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[8.5px] font-black text-cyan-200 tracking-tight truncate max-w-[50px]">You</span>
                  
                  <button
                    onClick={() => setShowGiftModal('TASAVVUR')}
                    className="absolute -top-1 -right-1 bg-yellow-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center text-[7px] font-black border border-white/20 hover:scale-105 active:scale-95 transition-transform"
                    title="Send Gift"
                  >
                    🎁
                  </button>
                </div>

                {/* Other simulated VIP room members */}
                {['𓆩𝐋𝐮𝐜𝐢𝐟𝐞𝐫𓆪', '꧁༺𝐀𝐧𝐠𝐞𝐥༻꧂', 'Sultan', 'Queen', 'Odin'].map((botName, index) => {
                  const isTalking = talkingBot === botName;

                  return (
                    <div key={index} className="flex flex-col items-center gap-1 flex-shrink-0 relative">
                      <div className={`w-11 h-11 rounded-full p-[2px] shadow-md flex items-center justify-center ${
                        isTalking ? 'bg-gradient-to-br from-emerald-400 to-green-500 animate-bounce' : 'bg-slate-800 border border-purple-500/20'
                      }`}>
                        <div className="w-full h-full bg-[#1C0930] rounded-full flex items-center justify-center text-xs text-white relative">
                          {botName.slice(0, 2)}
                          {isTalking && (
                            <span className="absolute bottom-0 right-0 bg-emerald-400 text-[6px] text-slate-950 font-black rounded-full px-1 py-0.5 leading-none shadow animate-pulse">
                              MIC
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[8.5px] font-bold text-slate-300 truncate max-w-[50px]">{botName}</span>

                      <button
                        onClick={() => setShowGiftModal(botName)}
                        className="absolute -top-1 -right-1 bg-yellow-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center text-[7px] font-black border border-white/20 hover:scale-105 active:scale-95 transition-transform"
                        title={`Gift to ${botName}`}
                      >
                        🎁
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. CHAT FEED BLOCK */}
            <div className="flex-1 rounded-2xl border border-white/10 bg-slate-950/40 p-3.5 overflow-y-auto no-scrollbar flex flex-col gap-3.5 mb-3">
              {chatMessages.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="rounded-xl border border-purple-500/20 bg-purple-950/20 px-3 py-2 text-[10px] text-purple-300 font-bold leading-normal text-center shadow-inner"
                    >
                      {msg.content}
                    </div>
                  );
                }

                const isMe = msg.sender === (user?.displayName || user?.username || 'TASAVVUR');
                
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                  >
                    {/* Message sender Avatar */}
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black shadow-md flex-shrink-0">
                      {isMe ? '👤' : msg.sender.slice(0, 1)}
                    </div>
                    
                    {/* Message Balloon bubble */}
                    <div className={`rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed shadow-md ${
                      isMe 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none' 
                        : 'bg-[#1C0930] text-slate-100 rounded-tl-none border border-purple-500/10'
                    }`}>
                      <span className="block text-[8px] font-black text-purple-300/80 mb-0.5 tracking-wider uppercase">
                        {msg.sender}
                      </span>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* 3. INPUT BAR & CONTROLS FOOTER */}
            <div className="flex flex-col gap-2.5 mb-24 flex-shrink-0">
              
              {/* Mic / Audio controls row */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
                    isMicOn
                      ? 'bg-red-500/20 border-red-500 text-red-400 shadow-md shadow-red-500/10'
                      : 'bg-slate-900 border-white/15 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isMicOn ? '🎤 Mic Active (ON)' : '🎙️ Mic Off'}
                </button>

                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
                    isSpeakerOn
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                      : 'bg-slate-900 border-white/15 text-slate-300'
                  }`}
                >
                  {isSpeakerOn ? '🔊 Audio ON' : '🔇 Audio Muted'}
                </button>
              </div>

              {/* Text Input Row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Say something public..."
                  className="flex-1 bg-slate-950/70 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 outline-none focus:border-amber-400/50"
                />
                
                <button
                  onClick={handleSendMessage}
                  className="w-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm border-0 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-lg"
                >
                  ➜
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-[370px] rounded-3xl bg-gradient-to-b from-slate-900 via-purple-950/90 to-slate-950 border-2 border-amber-400/40 p-5 shadow-[0_0_40px_rgba(245,158,11,0.3)] flex flex-col gap-4 text-center">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest">
                🏗️ Setup Social Room
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 text-slate-400 font-bold border-0 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Room Form */}
            <div className="flex flex-col gap-3.5 text-left text-xs">
              <div className="flex flex-col gap-1">
                <span className="font-black text-purple-300 uppercase text-[9px] tracking-wider">Room Title</span>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Saudi Elite Lounge 🕌"
                  className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-black text-purple-300 uppercase text-[9px] tracking-wider">Room Type</span>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as Room['type'])}
                    className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-2.5 text-white outline-none"
                  >
                    <option value="Casual Chat">Casual Chat</option>
                    <option value="VIP Lounge">VIP Lounge</option>
                    <option value="Music & Chill">Music & Chill</option>
                    <option value="Elite Ludo">Elite Ludo</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-black text-purple-300 uppercase text-[9px] tracking-wider">Country</span>
                  <select
                    value={newRoomCountry}
                    onChange={(e) => setNewRoomCountry(e.target.value)}
                    className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-2.5 text-white outline-none"
                  >
                    <option value="India">India 🇮🇳</option>
                    <option value="UAE">UAE 🇦🇪</option>
                    <option value="USA">USA 🇺🇸</option>
                    <option value="Brazil">Brazil 🇧🇷</option>
                    <option value="UK">UK 🇬🇧</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-black text-purple-300 uppercase text-[9px] tracking-wider">Min VIP Rank</span>
                  <select
                    value={newRoomMinVip}
                    onChange={(e) => setNewRoomMinVip(e.target.value as Room['minVipRank'])}
                    className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-2.5 text-white outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Gold">Gold</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-black text-purple-300 uppercase text-[9px] tracking-wider">Entry Bet</span>
                  <select
                    value={newRoomBet}
                    onChange={(e) => setNewRoomBet(Number(e.target.value))}
                    className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-2.5 text-white outline-none font-mono text-yellow-300"
                  >
                    <option value="2000">🪙 2,000</option>
                    <option value="5000">🪙 5,000</option>
                    <option value="10000">🪙 10,000</option>
                    <option value="50000">🪙 50,000</option>
                    <option value="100000">🪙 100,000</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-2xl border-0 uppercase hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg"
            >
              🚀 Launch Room
            </button>
          </div>
        </div>
      )}

      {/* SEND GIFT MODAL OVERLAY */}
      {showGiftModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-[350px] rounded-3xl bg-gradient-to-b from-slate-900 via-purple-950/90 to-slate-950 border-2 border-yellow-400/40 p-5 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col gap-4 text-center">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-black text-yellow-300 uppercase tracking-widest">
                🎁 Send Gift Coins to {showGiftModal}
              </h3>
              <button
                onClick={() => setShowGiftModal(null)}
                className="w-7 h-7 rounded-full bg-white/5 text-slate-400 font-bold border-0 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">
              Choose the coin amount to transfer as a support gift. Coins will be deducted from your wallet.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono font-black text-yellow-300">
              {[1000, 5000, 10000, 50000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleSendGift(amt)}
                  className="py-3 bg-slate-950/80 border border-white/10 rounded-xl hover:border-yellow-400/50 hover:bg-yellow-950/15 cursor-pointer text-xs flex items-center justify-center gap-1 transition-all"
                >
                  🪙 {amt.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowGiftModal(null)}
              className="w-full py-2 bg-slate-800 text-slate-400 font-black text-[10px] rounded-xl border-0 uppercase cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SocialRoomHubPage;
