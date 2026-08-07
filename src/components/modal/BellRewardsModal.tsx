import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../user/user.store';
import confetti from 'canvas-confetti';

interface BellRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityNotification {
  id: string;
  title: string;
  desc: string;
  rewardType: 'gems' | 'coins' | 'crowns';
  amount: number;
  time: string;
  claimed: boolean;
  type: 'referral' | 'redeem' | 'system';
}

const awardDiamondsToInviter = (invitationCode: string) => {
  if (typeof window === 'undefined') return;
  try {
    const trimmedCode = invitationCode.trim().toUpperCase();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ludo_guest_') || key.startsWith('ludo_google_') || key.startsWith('ludo_facebook_') || key === 'ludo_user_profile_v8')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const profile = JSON.parse(item);
            if (profile && profile.id && profile.username) {
              const cleanId = profile.id.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase();
              const cleanName = profile.username.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
              const derivedCode = `LUDO-${cleanName}${cleanId}`;
              
              if (derivedCode === trimmedCode) {
                const updatedProfile = {
                  ...profile,
                  gems: (profile.gems || 0) + 1000
                };
                localStorage.setItem(key, JSON.stringify(updatedProfile));
                console.log(`Successfully awarded 1,000 gems to inviter profile saved at key: ${key}`);
              }
            }
          } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.warn('Error awarding diamonds to inviter:', err);
  }
};

const isValidInviterCode = (invitationCode: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const trimmedCode = invitationCode.trim().toUpperCase();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ludo_guest_') || key.startsWith('ludo_google_') || key.startsWith('ludo_facebook_') || key === 'ludo_user_profile_v8')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const profile = JSON.parse(item);
            if (profile && profile.id && profile.username) {
              const cleanId = profile.id.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase();
              const cleanName = profile.username.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
              const derivedCode = `LUDO-${cleanName}${cleanId}`;
              if (derivedCode === trimmedCode) {
                return true;
              }
            }
          } catch (e) {}
        }
      }
    }
  } catch (err) {}
  return false;
};

export const BellRewardsModal: React.FC<BellRewardsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<'invite' | 'redeem' | 'notifications'>('invite');
  
  // Redeem input state
  const [inputCode, setInputCode] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Storage key for claimed redeem codes
  const userId = user?.id || 'guest';
  const CLAIMED_CODES_KEY = `ludo_claimed_redeem_codes_${userId}_v1`;
  const CLAIMED_REFERRAL_KEY = `ludo_claimed_referral_code_${userId}_v1`;
  const NOTIFS_KEY = `ludo_bell_notifications_${userId}_v1`;

  // State logs
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);
  const [hasClaimedReferral, setHasClaimedReferral] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Unique player referral code derived from ID or username
  const myReferralCode = React.useMemo(() => {
    if (!user) return 'LUDO-EXPERT1';
    const cleanId = (user.id || '99').replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase();
    const cleanName = (user.username || 'PLAYER').replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
    return `LUDO-${cleanName}${cleanId}`;
  }, [user]);

  // Load from local storage when userId changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setIsLoaded(false);
        const savedCodes = localStorage.getItem(CLAIMED_CODES_KEY);
        setClaimedCodes(savedCodes ? JSON.parse(savedCodes) : []);

        setHasClaimedReferral(localStorage.getItem(CLAIMED_REFERRAL_KEY) !== null);

        const savedNotifs = localStorage.getItem(NOTIFS_KEY);
        if (savedNotifs) {
          setNotifications(JSON.parse(savedNotifs));
        } else {
          // Default starting notifications
          setNotifications([
            {
              id: 'notif_welcome_invite',
              title: '🎉 Invite & Earn Bonus',
              desc: 'Invite your friends! Get 💎 1,000 Diamonds instantly when they sign up.',
              rewardType: 'gems',
              amount: 0,
              time: 'Just now',
              claimed: true,
              type: 'referral',
            },
            {
              id: 'notif_promo_gift',
              title: '🎁 Welcome Gift Package',
              desc: 'Use redeem code WELCOME1000 for extra 1,000 Gems + 5,000 Coins!',
              rewardType: 'gems',
              amount: 0,
              time: '1h ago',
              claimed: true,
              type: 'redeem',
            },
            {
              id: 'notif_daily_bonus',
              title: '👑 Daily VIP Reward',
              desc: 'Daily bonus granted for active Ludo Enterprise champion!',
              rewardType: 'gems',
              amount: 500,
              time: 'Today',
              claimed: true,
              type: 'system',
            }
          ]);
        }
        setIsLoaded(true);
      } catch (e) {
        console.warn('Failed to load user-specific rewards data:', e);
      }
    }
  }, [userId, CLAIMED_CODES_KEY, CLAIMED_REFERRAL_KEY, NOTIFS_KEY]);

  // Persist notifications & claimed codes reactively once loaded
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
      localStorage.setItem(CLAIMED_CODES_KEY, JSON.stringify(claimedCodes));
    }
  }, [notifications, claimedCodes, isLoaded, NOTIFS_KEY, CLAIMED_CODES_KEY]);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3200);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#A855F7', '#EC4899', '#F59E0B', '#10B981', '#3B82F6']
    });
  };

  // 1. Copy Referral Code to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(myReferralCode);
    setCopiedCode(true);
    showToast(`Code copied: ${myReferralCode}`, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 2. Share Referral Code & Game Download Link
  const handleShareInvite = async () => {
    const inviteText = `🎮 Join me on Ludo Enterprise! Enter my invitation code [${myReferralCode}] on signup or in the Bell menu to get 💎 1,000 Diamonds INSTANTLY! Download and play now!`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ludo Enterprise - Invitation Gift',
          text: inviteText,
          url: shareUrl,
        });
        showToast('Invite link shared successfully!', 'success');
      } catch (err) {
        // User cancelled or share failed fallback
        navigator.clipboard.writeText(inviteText);
        showToast('Invite message copied to clipboard!', 'success');
      }
    } else {
      navigator.clipboard.writeText(inviteText);
      showToast('Invite message copied to clipboard!', 'success');
    }
  };

  // 3. Redeem Code Logic (Handles Official Codes + Player Invitation Codes)
  const handleRedeemCode = () => {
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) {
      showToast('Please enter a valid Redeem or Invitation code', 'error');
      return;
    }

    setIsRedeeming(true);

    setTimeout(() => {
      setIsRedeeming(false);

      // Check if it's player's own code
      if (trimmed === myReferralCode) {
        showToast('You cannot redeem your own invitation code!', 'error');
        return;
      }

      // Check if already claimed
      if (claimedCodes.includes(trimmed)) {
        showToast('This code has already been redeemed!', 'error');
        return;
      }

      const currentGems = user?.gems || 0;
      const currentCoins = user?.coins || 0;
      const currentCrowns = user?.crowns || 0;

      // Handle Official Promo Codes
      if (trimmed === 'COINS999K' || trimmed === 'LUDO999K' || trimmed === 'JACKPOT999K') {
        updateUser({ coins: currentCoins + 999000, gems: currentGems + 9999 });
        setClaimedCodes(prev => [...prev, trimmed]);
        triggerConfetti();
        showToast('💰 MEGA COIN JACKPOT! Received 🪙 999,000 Coins & 💎 9,999 Gems!', 'success');
        setInputCode('');

        setNotifications(prev => [
          {
            id: `notif_claimed_${Date.now()}`,
            title: '💰 999K Mega Coin Gift Code',
            desc: `Redeemed code ${trimmed} (+999,000 Coins & +9,999 Gems)`,
            rewardType: 'coins',
            amount: 999000,
            time: 'Just now',
            claimed: true,
            type: 'redeem'
          },
          ...prev
        ]);
        return;
      }

      if (trimmed === 'COINS100K' || trimmed === 'LUDO100K') {
        updateUser({ coins: currentCoins + 100000 });
        setClaimedCodes(prev => [...prev, trimmed]);
        triggerConfetti();
        showToast('💰 COINS BOOSTER! Received 🪙 100,000 Coins!', 'success');
        setInputCode('');

        setNotifications(prev => [
          {
            id: `notif_claimed_${Date.now()}`,
            title: '💰 100K Coins Gift Code',
            desc: `Redeemed code ${trimmed} (+100,000 Coins)`,
            rewardType: 'coins',
            amount: 100000,
            time: 'Just now',
            claimed: true,
            type: 'redeem'
          },
          ...prev
        ]);
        return;
      }

      if (trimmed === 'WELCOME1000' || trimmed === 'LUDO1000') {

        updateUser({ gems: currentGems + 1000, coins: currentCoins + 5000 });
        setClaimedCodes(prev => [...prev, trimmed]);
        triggerConfetti();
        showToast('🎉 WELCOME GIFT CLAIMED! Received 💎 1,000 Gems & 🪙 5,000 Coins!', 'success');
        setInputCode('');
        
        // Add to notification log
        setNotifications(prev => [
          {
            id: `notif_claimed_${Date.now()}`,
            title: '🎁 Welcome Code Redeemed',
            desc: 'Redeemed code WELCOME1000 (+1,000 Gems, +5,000 Coins)',
            rewardType: 'gems',
            amount: 1000,
            time: 'Just now',
            claimed: true,
            type: 'redeem'
          },
          ...prev
        ]);
        return;
      }

      if (trimmed === 'FREEGEMS' || trimmed === 'GEMS500') {
        updateUser({ gems: currentGems + 500 });
        setClaimedCodes(prev => [...prev, trimmed]);
        triggerConfetti();
        showToast('🎉 CODE APPLIED! Received 💎 500 Diamonds!', 'success');
        setInputCode('');
        return;
      }

      if (trimmed === 'VIP777' || trimmed === 'LUDO2026') {
        updateUser({ gems: currentGems + 1000, crowns: currentCrowns + 10 });
        setClaimedCodes(prev => [...prev, trimmed]);
        triggerConfetti();
        showToast('👑 VIP CODE REDEEMED! Received 💎 1,000 Gems & 👑 10 Crowns!', 'success');
        setInputCode('');
        return;
      }

      // Handle Player Referral / Invitation Code format (e.g. LUDO-XXXX or 6+ char code)
      if (trimmed.startsWith('LUDO-') || trimmed.length >= 6) {
        if (hasClaimedReferral) {
          showToast('You have already claimed an invitation code reward!', 'error');
          return;
        }

        // Validate if it is a real player's code
        if (!isValidInviterCode(trimmed)) {
          showToast('Invalid invitation code! Player does not exist.', 'error');
          return;
        }

        awardDiamondsToInviter(trimmed);
        updateUser({ gems: currentGems + 1000 });
        setClaimedCodes(prev => [...prev, trimmed]);
        setHasClaimedReferral(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(CLAIMED_REFERRAL_KEY, trimmed);
        }

        triggerConfetti();
        showToast('🎉 INVITATION CODE ACCEPTED! Instant 💎 1,000 Diamonds awarded!', 'success');
        setInputCode('');

        setNotifications(prev => [
          {
            id: `notif_invite_${Date.now()}`,
            title: '🤝 Player Invitation Reward',
            desc: `Used invitation code ${trimmed} (+1,000 Diamonds)`,
            rewardType: 'gems',
            amount: 1000,
            time: 'Just now',
            claimed: true,
            type: 'referral'
          },
          ...prev
        ]);
        return;
      }

      // Default fallback for custom codes
      showToast('Invalid or expired code. Try WELCOME1000 or an invitation code.', 'error');
    }, 400);
  };

  // Claim notification reward
  const handleClaimNotificationReward = (notifId: string, amount: number) => {
    const currentGems = user?.gems || 0;
    updateUser({ gems: currentGems + amount });
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, claimed: true } : n));
    triggerConfetti();
    showToast(`💎 Claimed ${amount} Diamonds!`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999] flex items-center justify-center p-3 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[1000] px-5 py-2.5 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2 border animate-bounce ${
          toastMsg.type === 'success' 
            ? 'bg-emerald-950 border-emerald-400 text-emerald-200 shadow-emerald-900/50'
            : toastMsg.type === 'error'
            ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-rose-900/50'
            : 'bg-purple-950 border-amber-400 text-amber-200 shadow-purple-900/50'
        }`}>
          <span>{toastMsg.type === 'success' ? '✅' : toastMsg.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Main Dialog Container */}
      <div className="w-full max-w-[390px] bg-gradient-to-b from-[#210B3B] via-[#140626] to-[#0A0314] rounded-[28px] border-2 border-amber-400/40 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative text-white flex flex-col max-h-[88vh] overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-b from-rose-500 to-red-700 border border-yellow-300 rounded-full flex items-center justify-center text-white font-black text-xs hover:scale-110 active:scale-95 transition-transform z-50 shadow-lg cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-purple-500/20 pb-3 mb-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 p-[1.5px] shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <div className="w-full h-full bg-[#1A092F] rounded-[14px] flex items-center justify-center">
              <img src="/assets/images/icons/luxury_bell.png" className="w-6 h-6 object-contain animate-pulse" alt="Bell" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-black text-amber-300 tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Rewards & Invitation Hub
            </h2>
            <p className="text-[10px] text-purple-200/80 font-medium">
              Invite friends & redeem promo codes for instant 💎 Diamonds!
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-purple-950/60 p-1 rounded-2xl border border-purple-500/30 mb-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab('invite')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'invite'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg scale-[1.02]'
                : 'text-purple-200 hover:bg-purple-900/50'
            }`}
          >
            <span>🎁</span>
            <span>Invite</span>
          </button>
          
          <button
            onClick={() => setActiveTab('redeem')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'redeem'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg scale-[1.02]'
                : 'text-purple-200 hover:bg-purple-900/50'
            }`}
          >
            <span>🎟️</span>
            <span>Redeem</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer relative ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg scale-[1.02]'
                : 'text-purple-200 hover:bg-purple-900/50'
            }`}
          >
            <span>🔔</span>
            <span>Alerts</span>
            {notifications.some(n => !n.claimed) && (
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute top-1 right-1" />
            )}
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar flex flex-col gap-3">
          
          {/* TAB 1: INVITE & EARN */}
          {activeTab === 'invite' && (
            <div className="flex flex-col gap-3">
              {/* Highlight Hero Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/90 via-indigo-950 to-slate-950 border border-amber-400/40 p-3.5 shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-900/80 border border-amber-300/40 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <img src="/assets/images/icons/icon_diamond.png" className="w-8 h-8 object-contain animate-bounce" alt="Diamonds" />
                  </div>
                  <div>
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                      INSTANT REWARD
                    </span>
                    <h3 className="text-sm font-black text-amber-200 mt-0.5">
                      Get 💎 1,000 Diamonds Per Invite!
                    </h3>
                    <p className="text-[10px] text-purple-200/90 leading-tight">
                      When your friend downloads & enters your invitation code, you both get 1,000 Diamonds immediately!
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Personal Invitation Code Box */}
              <div className="bg-purple-950/70 border border-purple-500/30 rounded-2xl p-3 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-purple-300/90 uppercase tracking-wider">
                  YOUR PERSONAL INVITATION CODE
                </span>
                
                <div className="flex items-center justify-between bg-black/60 border border-amber-400/50 rounded-xl px-3 py-2">
                  <span className="font-mono text-base font-black text-amber-300 tracking-wider">
                    {myReferralCode}
                  </span>

                  <button
                    onClick={handleCopyCode}
                    className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 px-3 py-1 rounded-lg text-xs font-black active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{copiedCode ? '✓ Copied' : '📋 Copy'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={handleShareInvite}
                    className="w-full bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:brightness-110 text-white font-black text-xs py-2 rounded-xl border border-emerald-300/40 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>💬 Share via WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareInvite}
                    className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs py-2 rounded-xl border border-amber-300 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🔗 Invite Link</span>
                  </button>
                </div>
              </div>

              {/* How it Works Step-by-Step */}
              <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-3 flex flex-col gap-2">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                  How Invitation Reward Works:
                </span>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-black/30 p-2 rounded-xl border border-purple-500/20 flex flex-col items-center">
                    <span className="text-base mb-0.5">1️⃣</span>
                    <span className="text-[9px] font-bold text-white">Share Code</span>
                    <span className="text-[8px] text-purple-300/70">Send code to friend</span>
                  </div>

                  <div className="bg-black/30 p-2 rounded-xl border border-purple-500/20 flex flex-col items-center">
                    <span className="text-base mb-0.5">2️⃣</span>
                    <span className="text-[9px] font-bold text-white">Friend Joins</span>
                    <span className="text-[8px] text-purple-300/70">Signs up & enters code</span>
                  </div>

                  <div className="bg-black/30 p-2 rounded-xl border border-purple-500/20 flex flex-col items-center">
                    <span className="text-base mb-0.5">3️⃣</span>
                    <span className="text-[9px] font-bold text-amber-300">💎 +1,000 Gems</span>
                    <span className="text-[8px] text-purple-300/70">Instant diamond reward</span>
                  </div>
                </div>
              </div>

              {/* Recent Referrals summary */}
              <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-purple-300 block">Total Invited Players</span>
                  <span className="text-sm font-black text-white">2 Players Joined</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-purple-300 block">Total Diamonds Earned</span>
                  <span className="text-sm font-black text-amber-300 flex items-center justify-end gap-1">
                    <img src="/assets/images/icons/icon_diamond.png" className="w-4 h-4 object-contain" alt="" />
                    2,000
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REDEEM CODE */}
          {activeTab === 'redeem' && (
            <div className="flex flex-col gap-3">
              {/* Input Card */}
              <div className="bg-purple-950/70 border border-amber-400/40 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-lg">
                <label className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                  Enter Redeem Code or Player Invitation Code
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="e.g. WELCOME1000 or LUDO-A8X9"
                    className="flex-1 bg-black/70 border border-purple-500/50 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-mono text-amber-200 placeholder-purple-400/50 outline-none uppercase"
                  />
                  
                  <button
                    onClick={handleRedeemCode}
                    disabled={isRedeeming}
                    className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md border border-amber-300 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isRedeeming ? 'Validating...' : 'REDEEM'}
                  </button>
                </div>

                <p className="text-[9px] text-purple-200/70 leading-tight">
                  Enter any official promo code or a friend's invitation code here to claim instant 💎 1,000 Diamonds!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS & ALERTS */}
          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                  Recent Gifts & Activity Logs
                </span>
                <span className="text-[9px] text-purple-300">
                  {notifications.filter(n => !n.claimed).length} Unclaimed
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8 text-purple-300 text-xs">
                  No notifications yet!
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                      notif.claimed
                        ? 'bg-purple-950/20 border-purple-500/20 opacity-75'
                        : 'bg-purple-950/80 border-amber-400/50 shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-900/80 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                        {notif.type === 'referral' ? '🎁' : notif.type === 'redeem' ? '🎟️' : '👑'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-white truncate">{notif.title}</span>
                        <span className="text-[9px] text-purple-200/80 truncate">{notif.desc}</span>
                      </div>
                    </div>

                    {notif.amount <= 0 ? (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-500/30 flex-shrink-0">
                        📢 Active
                      </span>
                    ) : notif.claimed ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30 flex-shrink-0">
                        ✓ Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimNotificationReward(notif.id, notif.amount)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-lg shadow border border-emerald-300 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                      >
                        Claim 💎 {notif.amount}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer Wallet Balance Indicator */}
        <div className="mt-3 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-purple-200 flex-shrink-0">
          <span className="font-bold">Your Current Wallet:</span>
          <div className="flex items-center gap-3 font-black">
            <span className="flex items-center gap-1 text-amber-300">
              <img src="/assets/images/icons/icon_coin.png" className="w-3.5 h-3.5 object-contain" alt="" />
              {(user?.coins || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <img src="/assets/images/icons/icon_diamond.png" className="w-3.5 h-3.5 object-contain" alt="" />
              {(user?.gems || 0).toLocaleString()}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
