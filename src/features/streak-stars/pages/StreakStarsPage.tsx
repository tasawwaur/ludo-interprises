import React, { useState, useEffect } from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { useUserStore } from '../../../user/user.store';
import { usePlayerStatsStore } from '../../../store/player-stats.store';
import { useDiceStore } from '../../dice/store/dice.store';
import confetti from 'canvas-confetti';

interface StreakStarsPageProps {
  onBack?: () => void;
}

interface Milestone {
  targetStreak: number;
  rewardCoins: number;
  rewardGems: number;
  rewardLabel: string;
}

const MILESTONES: Milestone[] = [
  { targetStreak: 2, rewardCoins: 1500, rewardGems: 2, rewardLabel: '🪙 1.5K + 💎 2' },
  { targetStreak: 3, rewardCoins: 3000, rewardGems: 5, rewardLabel: '🪙 3.0K + 💎 5' },
  { targetStreak: 5, rewardCoins: 8000, rewardGems: 10, rewardLabel: '🪙 8.0K + 💎 10' },
  { targetStreak: 8, rewardCoins: 20000, rewardGems: 25, rewardLabel: '🪙 20K + 💎 25' },
  { targetStreak: 10, rewardCoins: 50000, rewardGems: 50, rewardLabel: '🪙 50K + 💎 50 + 👑 VIP' },
];

const DAILY_REWARDS = [
  { day: 1, coins: 500, gems: 0 },
  { day: 2, coins: 1000, gems: 1 },
  { day: 3, coins: 2000, gems: 2 },
  { day: 4, coins: 3500, gems: 3 },
  { day: 5, coins: 5000, gems: 5 },
  { day: 6, coins: 8000, gems: 8 },
  { day: 7, coins: 20000, gems: 20 },
];

export const StreakStarsPage: React.FC<StreakStarsPageProps> = ({ onBack }) => {
  const userStore = useUserStore();
  const user = userStore.user;

  const statsStore = usePlayerStatsStore();
  const currentWinStreak = statsStore.stats.currentWinStreak || 0;
  const highestWinStreak = statsStore.stats.highestWinStreak || 0;
  const dailyLoginStreak = statsStore.stats.dailyLoginStreak || 1;

  const diceStore = useDiceStore();

  const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);
  const [lastDailyClaimDate, setLastDailyClaimDate] = useState<string | null>(null);

  // Load claim history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMilestones = localStorage.getItem('ludo_streak_claimed_milestones_v1');
      if (savedMilestones) {
        try {
          setClaimedMilestones(JSON.parse(savedMilestones));
        } catch (_) {}
      }

      const savedDate = localStorage.getItem('ludo_streak_last_daily_claim_v1');
      if (savedDate) {
        setLastDailyClaimDate(savedDate);
      }
    }
  }, []);

  const saveMilestonesToStorage = (updated: number[]) => {
    setClaimedMilestones(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ludo_streak_claimed_milestones_v1', JSON.stringify(updated));
    }
  };

  const saveDailyClaimToStorage = (dateStr: string) => {
    setLastDailyClaimDate(dateStr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ludo_streak_last_daily_claim_v1', dateStr);
    }
  };

  // Check if daily is already claimed today
  const todayStr = new Date().toDateString();
  const isDailyClaimedToday = lastDailyClaimDate === todayStr;

  // Claim Win Streak Milestone Reward
  const handleClaimMilestone = (m: Milestone, e: React.MouseEvent) => {
    if (!user) return;
    if (currentWinStreak < m.targetStreak) return;
    if (claimedMilestones.includes(m.targetStreak)) return;

    // Fire Confetti at button location
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: ['#FFD700', '#FFA500', '#FF3D57', '#00E676'],
    });

    // Credit user currencies
    userStore.updateUser({
      coins: user.coins + m.rewardCoins,
      gems: user.gems + m.rewardGems,
      equippedFrame: m.targetStreak === 10 ? "frame_vip" : user.equippedFrame,
    });
    if (m.targetStreak === 10) {
      statsStore.updateStats({ hasVipPass: true });
    }

    // Save claim
    const updated = [...claimedMilestones, m.targetStreak];
    saveMilestonesToStorage(updated);
  };

  // Claim Daily Login Reward
  const handleClaimDaily = (e: React.MouseEvent) => {
    if (!user || isDailyClaimedToday) return;

    const currentDayReward = DAILY_REWARDS[(dailyLoginStreak - 1) % 7];

    // Fire Confetti
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x, y },
      colors: ['#FFD700', '#00E5FF', '#FF1744'],
    });

    // Credit currencies
    userStore.updateUser({
      coins: user.coins + currentDayReward.coins,
      gems: user.gems + currentDayReward.gems,
    });

    // Update login streak and claim date
    const nextStreak = dailyLoginStreak >= 7 ? 1 : dailyLoginStreak + 1;
    statsStore.updateStats({ dailyLoginStreak: nextStreak });
    saveDailyClaimToStorage(todayStr);
  };

  // Purchase Dice skin from streak shop
  const handleBuyDice = (diceId: string, costCoins: number, reqStreak: number) => {
    if (!user) return;
    
    // Check win streak requirement
    if (currentWinStreak < reqStreak) {
      alert(`⚠️ Requires a Win Streak of ${reqStreak} to purchase!`);
      return;
    }

    // Check funds
    if (user.coins < costCoins) {
      alert('⚠️ Insufficient Coins!');
      return;
    }

    // Check if already unlocked
    const targetDice = diceStore.diceItems.find((d) => d.id === diceId);
    if (targetDice && targetDice.isUnlocked) {
      alert('You already own this dice skin!');
      return;
    }

    // Deduct coins & unlock
    userStore.updateUser({ coins: user.coins - costCoins });
    
    // Custom unlock directly in store
    const updatedDiceItems = diceStore.diceItems.map((d) =>
      d.id === diceId ? { ...d, isUnlocked: true } : d
    );
    useDiceStore.setState({ diceItems: updatedDiceItems });
    localStorage.setItem('ludo_dice_items_v1', JSON.stringify(updatedDiceItems));

    confetti({
      particleCount: 60,
      spread: 80,
      colors: ['#FFD700', '#FFA500', '#1E88E5'],
    });
    alert('🎉 Successfully unlocked Dice skin! Go to Profile -> Inventory to equip it.');
  };

  const getDiceUnlockStatus = (diceId: string) => {
    const d = diceStore.diceItems.find((item) => item.id === diceId);
    return d ? d.isUnlocked : false;
  };

  return (
    <div className="min-h-screen w-full bg-[#0F041C] text-white flex flex-col items-center relative overflow-hidden select-none font-sans pb-10">
      <LudoPageBackground variant="home" />

      {/* Main Container */}
      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-4 py-4 overflow-y-auto no-scrollbar">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-cyan-200 via-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase glow-blue-text">
            STREAK STARS
          </h1>
          <div className="w-10 h-10"></div>
        </div>

        {/* Current Streak Cards Row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="relative rounded-2xl bg-gradient-to-br from-red-950/60 to-purple-950/50 border border-red-500/30 p-4 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex flex-col items-center justify-center text-center">
            <span className="text-2xl animate-pulse mb-1">🔥</span>
            <span className="text-[10px] font-black uppercase text-red-300 tracking-wider">Current Win Streak</span>
            <span className="text-xl font-black text-white mt-0.5 font-mono">{currentWinStreak} Matches</span>
            <span className="text-[9px] text-purple-300 mt-1">Highest Streak: {highestWinStreak}</span>
          </div>

          <div className="relative rounded-2xl bg-gradient-to-br from-cyan-950/60 to-blue-950/50 border border-cyan-500/30 p-4 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-1">⭐</span>
            <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider">Daily Login Streak</span>
            <span className="text-xl font-black text-white mt-0.5 font-mono">{dailyLoginStreak} Days</span>
            <span className="text-[9px] text-purple-300 mt-1">Claim rewards below</span>
          </div>
        </div>

        {/* SECTION 1: DAILY LOGIN STREAK REWARDS */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 flex flex-col gap-3 mb-5 backdrop-blur-md">
          <h2 className="text-xs font-black tracking-widest text-cyan-300 uppercase">
            📅 Consecutive Daily Login Rewards
          </h2>
          
          {/* Day Grid */}
          <div className="grid grid-cols-4 gap-2">
            {DAILY_REWARDS.map((d) => {
              const isActiveDay = dailyLoginStreak === d.day;
              const isClaimed = d.day < dailyLoginStreak || (d.day === 7 && dailyLoginStreak === 1 && isDailyClaimedToday);
              
              let borderClass = 'border-white/5 bg-slate-900/50';
              let textClass = 'text-slate-400';
              if (isActiveDay && !isDailyClaimedToday) {
                borderClass = 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(34,211,238,0.3)] animate-pulse';
                textClass = 'text-cyan-200';
              } else if (isClaimed) {
                borderClass = 'border-emerald-500/20 bg-emerald-950/10';
                textClass = 'text-emerald-400';
              }

              return (
                <div
                  key={d.day}
                  className={`rounded-xl border p-2 flex flex-col items-center justify-center text-center ${borderClass} relative`}
                >
                  <span className="text-[9px] font-black uppercase tracking-wider">{`Day ${d.day}`}</span>
                  <span className="text-[10px] font-black text-white mt-1">🪙{d.coins}</span>
                  {d.gems > 0 && <span className="text-[9px] font-black text-cyan-400">💎{d.gems}</span>}
                  
                  {isClaimed && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-black shadow-md">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleClaimDaily}
            disabled={isDailyClaimedToday}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all duration-300 cursor-pointer border-0 ${
              isDailyClaimedToday
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:scale-[1.02] active:scale-[0.98] shadow-cyan-500/30'
            }`}
          >
            {isDailyClaimedToday ? 'Already Claimed Today ✓' : `Claim Day ${dailyLoginStreak} Reward`}
          </button>
        </div>

        {/* SECTION 2: WIN STREAK MILESTONES */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 flex flex-col gap-3 mb-5 backdrop-blur-md">
          <h2 className="text-xs font-black tracking-widest text-red-400 uppercase">
            🔥 Win Streak Milestone Rewards
          </h2>

          <div className="flex flex-col gap-2.5">
            {MILESTONES.map((m) => {
              const isReached = currentWinStreak >= m.targetStreak;
              const isClaimed = claimedMilestones.includes(m.targetStreak);
              
              let statusLabel = 'LOCKED';
              let buttonBg = 'bg-slate-800 text-slate-500 cursor-not-allowed';
              
              if (isClaimed) {
                statusLabel = 'CLAIMED ✓';
                buttonBg = 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 cursor-not-allowed';
              } else if (isReached) {
                statusLabel = 'CLAIM NOW';
                buttonBg = 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:scale-105 active:scale-95 shadow-md shadow-yellow-500/20';
              }

              return (
                <div
                  key={m.targetStreak}
                  className="rounded-2xl border border-white/5 bg-slate-900/40 p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                      isReached ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {m.targetStreak}x
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{`Reach ${m.targetStreak} Win Streak`}</span>
                      <span className="text-[10px] text-yellow-300/90 font-bold mt-0.5">{m.rewardLabel}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleClaimMilestone(m, e)}
                    disabled={!isReached || isClaimed}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black border-0 uppercase transition-all duration-200 cursor-pointer ${buttonBg}`}
                  >
                    {statusLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: STREAK STARS SHOP */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 flex flex-col gap-3 mb-4 backdrop-blur-md">
          <h2 className="text-xs font-black tracking-widest text-indigo-300 uppercase">
            🛍️ Win Streak Stars Shop
          </h2>

          <div className="flex flex-col gap-3">
            {/* Item 1: Lucky Star Dice */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎲</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-cyan-200">Lucky Star Dice</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 leading-snug">Requires 2 Win Streak</span>
                  <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1 mt-1">
                    🪙 5,000 <span className="text-[9px] font-bold text-slate-400">Coins</span>
                  </span>
                </div>
              </div>

              {getDiceUnlockStatus('dice_lucky_star') ? (
                <span className="px-3.5 py-2 rounded-xl text-[9px] font-black uppercase bg-emerald-950/20 border border-emerald-500/20 text-emerald-400">
                  OWNED ✓
                </span>
              ) : (
                <button
                  onClick={() => handleBuyDice('dice_lucky_star', 5000, 2)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black border-0 uppercase cursor-pointer transition-all duration-200 ${
                    currentWinStreak >= 2
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  BUY
                </button>
              )}
            </div>

            {/* Item 2: Volcano Dice */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-950/30 border border-red-500/20 flex items-center justify-center">
                  <span className="text-2xl font-black text-red-500">☄️</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-red-300">Magma Core Dice</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 leading-snug">Requires 5 Win Streak</span>
                  <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1 mt-1">
                    🪙 12,000 <span className="text-[9px] font-bold text-slate-400">Coins</span>
                  </span>
                </div>
              </div>

              {getDiceUnlockStatus('dice_volcano') ? (
                <span className="px-3.5 py-2 rounded-xl text-[9px] font-black uppercase bg-emerald-950/20 border border-emerald-500/20 text-emerald-400">
                  OWNED ✓
                </span>
              ) : (
                <button
                  onClick={() => handleBuyDice('dice_volcano', 12000, 5)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black border-0 uppercase cursor-pointer transition-all duration-200 ${
                    currentWinStreak >= 5
                      ? 'bg-gradient-to-r from-red-500 to-purple-600 text-white hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  BUY
                </button>
              )}
            </div>

            {/* Item 3: Emperor Gold Dice */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-950/30 border border-yellow-500/20 flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-yellow-300">Emperor Gold Dice</span>
                  <span className="text-[9px] text-slate-400 mt-0.5 leading-snug">Requires 8 Win Streak</span>
                  <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1 mt-1">
                    🪙 30,000 <span className="text-[9px] font-bold text-slate-400">Coins</span>
                  </span>
                </div>
              </div>

              {getDiceUnlockStatus('dice_emperor') ? (
                <span className="px-3.5 py-2 rounded-xl text-[9px] font-black uppercase bg-emerald-950/20 border border-emerald-500/20 text-emerald-400">
                  OWNED ✓
                </span>
              ) : (
                <button
                  onClick={() => handleBuyDice('dice_emperor', 30000, 8)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black border-0 uppercase cursor-pointer transition-all duration-200 ${
                    currentWinStreak >= 8
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  BUY
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StreakStarsPage;
