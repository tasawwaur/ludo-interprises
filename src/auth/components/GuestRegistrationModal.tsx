import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface GuestRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    name: string;
    age: number;
    is18Plus: boolean;
    gender: 'male' | 'female' | 'other';
    avatar: string;
    guestId: string;
    invitationCode?: string;
  }) => void;
}

const PRESET_MALE_AVATARS = [
  '/assets/custom_icons/avatar_male_king.jpg',
  '/assets/custom_icons/avatar_king.png',
  '/assets/custom_icons/avatar_lion.png',
  '/assets/custom_icons/avatar_mafia.png',
  '/assets/custom_icons/avatar_female_ninja.png',
  '/assets/custom_icons/avatar_warrior.png',
];

const PRESET_FEMALE_AVATARS = [
  '/assets/custom_icons/avatar_female_queen_v2.jpg',
  '/assets/custom_icons/avatar_female_queen.png',
  '/assets/custom_icons/avatar_female_ninja.png',
  '/assets/custom_icons/avatar_female_mage.png',
  '/assets/custom_icons/avatar_sorcerer.png',
];

// Generate unique Guest ID e.g. GST-8A3F7K92
const generateGuestId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GST-${rand}`;
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

export const GuestRegistrationModal: React.FC<GuestRegistrationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [is18Plus, setIs18Plus] = useState<boolean | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  // Generated Guest ID
  const [guestId, setGuestId] = useState<string>('');
  const [invitationCode, setInvitationCode] = useState<string>('');

  // Status states
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState(0);
  const [isWelcome, setIsWelcome] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMsg(null);

    // Step 1: Name validation
    if (step === 1) {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMsg('Please enter a valid name (at least 2 characters).');
        return;
      }
      setStep(2);
      return;
    }

    // Step 2: Age validation
    if (step === 2) {
      const numAge = parseInt(age, 10);
      if (isNaN(numAge) || numAge < 5 || numAge > 100) {
        setErrorMsg('Please enter a valid age (5 - 100).');
        return;
      }
      if (is18Plus === null) {
        setIs18Plus(numAge >= 18);
      }
      setStep(3);
      return;
    }

    // Step 3: 18+ selection
    if (step === 3) {
      if (is18Plus === null) {
        setErrorMsg('Please select whether you are 18+ or not.');
        return;
      }
      setStep(4);
      return;
    }

    // Step 4: Gender selection
    if (step === 4) {
      if (!selectedAvatar) {
        setSelectedAvatar(gender === 'female' ? PRESET_FEMALE_AVATARS[0] : PRESET_MALE_AVATARS[0]);
      }
      setStep(5);
      return;
    }

    // Step 5: Avatar selection
    if (step === 5) {
      const avatarToUse = customAvatar || selectedAvatar || (gender === 'female' ? PRESET_FEMALE_AVATARS[0] : PRESET_MALE_AVATARS[0]);
      setSelectedAvatar(avatarToUse);
      setStep(6);
      return;
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateAccount = () => {
    setErrorMsg(null);
    const trimmedInvite = invitationCode.trim().toUpperCase();
    if (trimmedInvite) {
      if (!isValidInviterCode(trimmedInvite)) {
        setErrorMsg('Invalid invitation code! Please enter a real player code or clear the field.');
        return;
      }
    }

    setIsSaving(true);
    setSavingProgress(0);

    const newGuestId = generateGuestId();
    setGuestId(newGuestId);

    const finalAvatar = customAvatar || selectedAvatar || (gender === 'female' ? PRESET_FEMALE_AVATARS[0] : PRESET_MALE_AVATARS[0]);
    const numAge = parseInt(age, 10) || 21;

    // Smooth Gold Progress Animation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      setSavingProgress(Math.min(currentProgress, 100));

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsSaving(false);
          setIsWelcome(true);

          // Trigger Confetti Celebration
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#FFD700', '#FFA500', '#FF4500', '#00E5FF', '#D4AF37'],
          });
        }, 300);
      }
    }, 300);
  };

  const handleFinalEnterGame = () => {
    const finalAvatar = customAvatar || selectedAvatar || (gender === 'female' ? PRESET_FEMALE_AVATARS[0] : PRESET_MALE_AVATARS[0]);
    const numAge = parseInt(age, 10) || 21;

    onComplete({
      name: name.trim(),
      age: numAge,
      is18Plus: is18Plus ?? false,
      gender,
      avatar: finalAvatar,
      guestId: guestId || generateGuestId(),
      invitationCode: invitationCode.trim() ? invitationCode.trim().toUpperCase() : undefined,
    });
  };

  const handleCollectClick = () => {
    handleFinalEnterGame();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const res = evt.target.result as string;
          setCustomAvatar(res);
          setSelectedAvatar(res);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const avatarsList = gender === 'female' ? PRESET_FEMALE_AVATARS : PRESET_MALE_AVATARS;

  return (
    <div className="absolute inset-0 z-40 w-full h-full bg-gradient-to-b from-[#1c0533]/95 via-[#0c0217]/96 to-[#070110]/98 backdrop-blur-md font-sans select-none animate-in fade-in duration-150 overflow-hidden flex flex-col justify-start gap-3 pt-3 px-5 pb-4 text-white">
      
      {/* Dynamic CSS Animation for Flying Currency Particles */}
      <style>{`
        @keyframes flyUpCoins {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          60% { transform: translateY(-220px) scale(1.4) rotate(180deg); opacity: 1; }
          100% { transform: translateY(-460px) scale(0.3) rotate(360deg); opacity: 0; }
        }
        @keyframes flyUpGems {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          60% { transform: translateY(-220px) scale(1.4) rotate(-180deg); opacity: 1; }
          100% { transform: translateY(-460px) scale(0.3) rotate(-360deg); opacity: 0; }
        }
        @keyframes floatTextCoins {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          30% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-260px) scale(0.9); opacity: 0; }
        }
        @keyframes floatTextGems {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          30% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-260px) scale(0.9); opacity: 0; }
        }
      `}</style>
      
      {/* Top Header & Close Button */}
      {!isSaving && !isWelcome && (
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎲</span>
            <h3 className="text-sm font-black text-amber-300 tracking-wide uppercase">
              Guest Registration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/70 border border-amber-400/60 text-amber-300 hover:text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-all shadow-md"
            title="Close"
          >
            ✕
          </button>
        </div>
      )}

        {/* Step Progress Indicator Bar */}
        {!isSaving && !isWelcome && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-amber-200/80 uppercase">
              <span>Step {step} of 6</span>
              <span className="text-amber-400">
                {step === 1 && '1. Enter Name'}
                {step === 2 && '2. Enter Age'}
                {step === 3 && '3. Age 18+ Verification'}
                {step === 4 && '4. Select Gender'}
                {step === 5 && '5. Choose Avatar'}
                {step === 6 && '6. Create Account'}
              </span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-amber-500/30 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-500/60 rounded-xl p-2.5 text-xs text-red-200 font-medium text-center animate-shake">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ⏳ GOLD SAVING / CREATING ACCOUNT ANIMATION */}
        {isSaving && !isWelcome && (
          <div className="py-12 flex flex-col items-center justify-center gap-5 text-center animate-in fade-in duration-200">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
              <span className="text-3xl animate-bounce">🎲</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-amber-300 tracking-wider uppercase">
                Creating Guest Account...
              </h3>
              <span className="text-xs font-bold text-amber-200/70">
                Generating unique Guest ID & Unlocking Welcome Bonus...
              </span>
            </div>
            <div className="w-full max-w-[240px] h-3 bg-black/70 rounded-full overflow-hidden border border-amber-400/50 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                style={{ width: `${savingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 👑 WELCOME REWARDS ARTWORK OVERLAY (User Provided Image) */}
        {isWelcome && (
          <div 
            onClick={handleCollectClick}
            className="absolute inset-0 z-50 w-full h-full bg-[#0a0116] flex flex-col items-center justify-between p-4 animate-in zoom-in-95 duration-200 overflow-hidden cursor-pointer"
          >
            {/* Background 3D Artwork */}
            <img
              src="/welcome_rewards_bg.jpg"
              alt="Welcome Rewards Artwork"
              className="absolute inset-0 w-full h-full object-fill z-0 pointer-events-none"
            />

            {/* Top User Avatar Circle (Text hidden as requested) */}
            <div className="relative z-10 flex flex-col items-center mt-7 pointer-events-none gap-2">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-amber-400/90 p-0.5 shadow-[0_0_20px_rgba(255,215,0,0.6)] bg-purple-950 overflow-hidden">
                <img
                  src={customAvatar || selectedAvatar || (gender === 'female' ? PRESET_FEMALE_AVATARS[0] : PRESET_MALE_AVATARS[0])}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {invitationCode && (
                <div className="bg-emerald-500/90 border border-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-black text-white shadow-lg animate-pulse uppercase tracking-wider">
                  🤝 Invite Applied (+1,000 💎)
                </div>
              )}
            </div>

            {/* 🌟 DYNAMIC FLYING CURRENCY ANIMATION (Triggered on COLLECT) */}
            {isCollecting && (
              <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                {/* Flying Gold Coins shooting from Left Pedestal towards Top Header */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`coin-${i}`}
                    className="absolute"
                    style={{
                      left: `${24 + (i % 3) * 6}%`,
                      bottom: '32%',
                      animation: `flyUpCoins 1.1s cubic-bezier(0.2, 0.8, 0.4, 1) ${i * 0.08}s forwards`,
                    }}
                  >
                    <img
                      src="/assets/images/icons/luxury_coin.png"
                      alt="Coin Particle"
                      className="w-8 h-8 object-contain filter drop-shadow-[0_0_12px_rgba(255,215,0,0.9)]"
                    />
                  </div>
                ))}

                {/* Flying Blue Gems shooting from Right Pedestal towards Top Header */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`gem-${i}`}
                    className="absolute"
                    style={{
                      right: `${24 + (i % 3) * 6}%`,
                      bottom: '32%',
                      animation: `flyUpGems 1.1s cubic-bezier(0.2, 0.8, 0.4, 1) ${i * 0.08}s forwards`,
                    }}
                  >
                    <img
                      src="/assets/images/icons/luxury_gem.png"
                      alt="Gem Particle"
                      className="w-8 h-8 object-contain filter drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]"
                    />
                  </div>
                ))}

                {/* Rising Floating Reward Amounts */}
                <div
                  className="absolute left-[20%] bottom-[35%] text-yellow-300 font-black text-sm tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] bg-black/70 px-2 py-0.5 rounded-full border border-amber-400/60"
                  style={{ animation: `floatTextCoins 1.1s ease-out forwards` }}
                >
                  +10,000 COINS 🪙
                </div>

                <div
                  className="absolute right-[20%] bottom-[35%] text-cyan-300 font-black text-sm tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] bg-black/70 px-2 py-0.5 rounded-full border border-cyan-400/60"
                  style={{ animation: `floatTextGems 1.1s ease-out forwards` }}
                >
                  {invitationCode ? '+1,100 GEMS 💎' : '+100 GEMS 💎'}
                </div>
              </div>
            )}

            {/* Hotspot COLLECT Button positioned precisely over the 3D COLLECT Button */}
            <button
              type="button"
              onClick={handleCollectClick}
              className="absolute bottom-[11.5%] left-1/2 -translate-x-1/2 z-50 w-[62%] max-w-[210px] h-[46px] rounded-full bg-transparent hover:bg-transparent active:scale-95 transition-transform cursor-pointer border-0 outline-none shadow-none"
              style={{ WebkitTapHighlightColor: 'transparent', backgroundColor: 'transparent' }}
              title="Collect Rewards & Enter Game"
            />
          </div>
        )}

        {/* MAIN STEP CONTENT */}
        {!isSaving && !isWelcome && (
          <div className="flex flex-col gap-4 py-2 min-h-[220px]">
            
            {/* STEP 1: Enter Your Name */}
            {step === 1 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <img src="/assets/custom_icons/icon_user.png" alt="User Icon" className="w-7 h-7 object-contain drop-shadow" />
                  <span>1. Enter Your Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tasavvur, Malik, Roxana..."
                  autoFocus
                  className="w-full px-4 py-3 bg-black/70 border-2 border-amber-500/40 rounded-xl text-white placeholder-amber-200/30 font-bold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
                <p className="text-[11px] text-amber-200/60 leading-relaxed">
                  This display name will be visible to other players in multiplayer matches.
                </p>
              </div>
            )}

            {/* STEP 2: Enter Your Age */}
            {step === 2 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <img src="/assets/custom_icons/icon_calendar.png" alt="Calendar Icon" className="w-7 h-7 object-contain drop-shadow" />
                  <span>2. Enter Your Age</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={age}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAge(val);
                    const n = parseInt(val, 10);
                    if (!isNaN(n)) setIs18Plus(n >= 18);
                  }}
                  placeholder="Enter your age in years..."
                  autoFocus
                  className="w-full px-4 py-3 bg-black/70 border-2 border-amber-500/40 rounded-xl text-white placeholder-amber-200/30 font-bold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
                <div className="flex justify-between gap-2 pt-1">
                  {[18, 21, 25, 30].map((quickAge) => (
                    <button
                      key={quickAge}
                      type="button"
                      onClick={() => {
                        setAge(quickAge.toString());
                        setIs18Plus(quickAge >= 18);
                      }}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        parseInt(age, 10) === quickAge
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-black/40 border-amber-500/30 text-amber-200 hover:bg-amber-500/20'
                      }`}
                    >
                      {quickAge} Yrs
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Are you 18+ ? */}
            {step === 3 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <img src="/assets/custom_icons/icon_18plus.png" alt="18+ Icon" className="w-7 h-7 object-contain drop-shadow" />
                  <span>3. Are you 18+ ?</span>
                </label>
                <p className="text-[11px] text-amber-200/70">
                  Select your age status for age-restricted gaming features.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIs18Plus(true)}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      is18Plus === true
                        ? 'bg-gradient-to-b from-amber-500 to-yellow-600 text-black border-amber-300 shadow-lg scale-[1.02]'
                        : 'bg-black/50 border-amber-500/30 text-white hover:border-amber-400/60'
                    }`}
                  >
                    <img src="/assets/custom_icons/icon_shield_check.png" alt="Yes 18+" className="w-10 h-10 object-contain drop-shadow" />
                    <span className="font-black text-xs uppercase">YES (18+)</span>
                    <span className="text-[10px] opacity-80 font-semibold">Full Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIs18Plus(false)}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      is18Plus === false
                        ? 'bg-gradient-to-b from-amber-500 to-yellow-600 text-black border-amber-300 shadow-lg scale-[1.02]'
                        : 'bg-black/50 border-amber-500/30 text-white hover:border-amber-400/60'
                    }`}
                  >
                    <img src="/assets/custom_icons/icon_shield_x.png" alt="No Under 18" className="w-10 h-10 object-contain drop-shadow" />
                    <span className="font-black text-xs uppercase">NO (&lt;18)</span>
                    <span className="text-[10px] opacity-80 font-semibold">Junior Mode</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Select Gender */}
            {step === 4 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-lg">🚻</span> 4. Select Gender
                </label>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGender('male');
                      setSelectedAvatar(PRESET_MALE_AVATARS[0]);
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      gender === 'male'
                        ? 'bg-gradient-to-b from-amber-500 to-yellow-600 text-black border-amber-300 shadow-lg scale-[1.02]'
                        : 'bg-black/50 border-amber-500/30 text-white hover:border-amber-400/60'
                    }`}
                  >
                    <img src="/assets/custom_icons/icon_male.png" alt="Male" className="w-11 h-11 object-contain drop-shadow" />
                    <span className="font-black text-xs uppercase">Male</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGender('female');
                      setSelectedAvatar(PRESET_FEMALE_AVATARS[0]);
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      gender === 'female'
                        ? 'bg-gradient-to-b from-amber-500 to-yellow-600 text-black border-amber-300 shadow-lg scale-[1.02]'
                        : 'bg-black/50 border-amber-500/30 text-white hover:border-amber-400/60'
                    }`}
                  >
                    <img src="/assets/custom_icons/icon_female.png" alt="Female" className="w-11 h-11 object-contain drop-shadow" />
                    <span className="font-black text-xs uppercase">Female</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Select Avatar */}
            {step === 5 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>🖼️ 5. Select Avatar</span>
                  <span className="text-[10px] text-amber-200/70 font-normal">({gender.toUpperCase()})</span>
                </label>

                {/* Preset Avatars Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {avatarsList.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedAvatar(url);
                        setCustomAvatar(null);
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all bg-black/60 flex items-center justify-center p-1 ${
                        selectedAvatar === url && !customAvatar
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg'
                          : 'border-amber-500/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover rounded-xl" />
                      {selectedAvatar === url && !customAvatar && (
                        <span className="absolute top-1 right-1 bg-amber-400 text-black text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow">
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom Photo Upload */}
                <div className="pt-2 border-t border-amber-500/20">
                  <label className="w-full py-2.5 px-3 bg-black/50 border border-dashed border-amber-400/50 hover:border-amber-400 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-amber-200 hover:text-white">
                    <span className="text-base">📸</span>
                    <span className="text-xs font-bold">
                      {customAvatar ? 'Custom Photo Uploaded ✓' : 'Upload Custom Avatar'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* STEP 6: CREATE ACCOUNT Summary */}
            {step === 6 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📋</span> 6. Confirm Profile Details
                </label>

                <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-2.5">
                  <div className="flex items-center gap-3 border-b border-amber-500/20 pb-2.5">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden bg-purple-900 flex-shrink-0">
                      <img
                        src={customAvatar || selectedAvatar || (gender === 'female' ? PRESET_FEMALE_AVATARS[0] : PRESET_MALE_AVATARS[0])}
                        alt="Final Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white truncate">{name}</h4>
                      <p className="text-[11px] text-amber-300/80 font-bold uppercase">{gender} Guest Player</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-purple-950/40 p-2 rounded-xl border border-purple-500/20">
                      <span className="text-[10px] text-amber-200/60 block font-semibold">AGE</span>
                      <span className="font-extrabold text-white">{age} Years Old</span>
                    </div>
                    <div className="bg-purple-950/40 p-2 rounded-xl border border-purple-500/20">
                      <span className="text-[10px] text-amber-200/60 block font-semibold">STATUS</span>
                      <span className="font-extrabold text-amber-300">{is18Plus ? '18+ Verified' : 'Under 18'}</span>
                    </div>
                  </div>
                </div>

                {/* Invitation Code (Optional) */}
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-3.5 flex flex-col gap-1.5 shadow-inner">
                  <label className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🤝</span> Invitation Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    placeholder="e.g. LUDO-ABCD123"
                    className="w-full px-3 py-2 bg-black/70 border border-purple-500/50 focus:border-amber-400 rounded-xl text-white placeholder-purple-400/40 font-mono text-xs uppercase tracking-wider focus:outline-none"
                  />
                  <p className="text-[9px] text-purple-200/70 leading-tight">
                    Enter a friend's invitation code here to get 💎 1,000 Diamonds instantly on signup!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM NAV BUTTONS */}
        {!isSaving && !isWelcome && (
          <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20 mb-14 sm:mb-16">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 bg-black/60 hover:bg-black/90 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-500/40 active:scale-95 transition-all"
              >
                ← Back
              </button>
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-xs tracking-wider uppercase rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <span>NEXT</span>
                <span>→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateAccount}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs tracking-wider uppercase rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 animate-pulse"
              >
                <span>CREATE ACCOUNT</span>
                <span>🚀</span>
              </button>
            )}
          </div>
        )}

    </div>
  );
};
