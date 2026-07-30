import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import confetti from "canvas-confetti";
import { formatPlayerUID } from "../../../utils/uuid";
import { loginWithFacebook } from "../../../auth/utils/fb";
import { triggerGoogleOAuth } from "../../../auth/utils/google";
import { UserProfile } from "../../../user/user.store";

interface ProfilePageProps {
  onBack?: () => void;
  onOpenHistory?: () => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onOpenHistory, onLogout }) => {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const updateUser = useUserStore((s) => s.updateUser);
  const logout = useUserStore((s) => s.logout);

  // States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modals
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState("");
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState("");
  const [upgradePassword, setUpgradePassword] = useState("");

  const [showPhoneLinkModal, setShowPhoneLinkModal] = useState(false);
  const [linkPhoneNumber, setLinkPhoneNumber] = useState("");
  const [linkPhoneVerification, setLinkPhoneVerification] = useState("");

  const [showFBLinkModal, setShowFBLinkModal] = useState(false);
  const [fbLinkName, setFbLinkName] = useState("");

  const [showGoogleLinkModal, setShowGoogleLinkModal] = useState(false);
  const [googleLinkEmail, setGoogleLinkEmail] = useState("");
  const [googleLinkName, setGoogleLinkName] = useState("");

  // Simulated link states stored in localStorage or store
  const [isFBLinked, setIsFBLinked] = useState(() => {
    return user?.loginProvider === 'facebook' || !!user?.facebookId || localStorage.getItem("ludo_fb_linked") === "true";
  });
  const [isGoogleLinked, setIsGoogleLinked] = useState(() => {
    return user?.loginProvider === 'google' || !!user?.googleId || localStorage.getItem("ludo_google_linked") === "true";
  });
  const [isPhoneLinked, setIsPhoneLinked] = useState(() => {
    return user?.loginProvider === 'phone' || localStorage.getItem("ludo_phone_linked") === "true";
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem("ludo_fb_linked", isFBLinked ? "true" : "false");
  }, [isFBLinked]);

  useEffect(() => {
    localStorage.setItem("ludo_google_linked", isGoogleLinked ? "true" : "false");
  }, [isGoogleLinked]);

  useEffect(() => {
    localStorage.setItem("ludo_phone_linked", isPhoneLinked ? "true" : "false");
  }, [isPhoneLinked]);

  // Load avatar and name fallbacks
  const playerName = user?.displayName || user?.username || "TASAVVUR";
  const playerUID = formatPlayerUID(user);

  // Actions
  const handleCopyUID = () => {
    navigator.clipboard.writeText(playerUID);
    triggerToast("UID Copied to Clipboard!");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        updateUser({ avatar: base64 });
        triggerToast("Profile Photo Updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    updateUser({
      displayName: trimmed,
      username: trimmed
    });
    setShowEditName(false);
    triggerToast("Username Updated!");
  };

  const handleChangePasswordSubmit = () => {
    if (!currPassword || !newPassword || !confirmPassword) {
      triggerToast("Please fill all fields!");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("Passwords do not match!");
      return;
    }
    localStorage.setItem("ludo_player_password", newPassword);
    setShowChangePassword(false);
    setCurrPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerToast("Password Updated Successfully!");
  };

  const handleUpgradeAccount = () => {
    if (!upgradeEmail.trim()) {
      triggerToast("Please enter an email");
      return;
    }
    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#FFD700', '#FFA500', '#FFD54F']
    });
    updateUser({
      email: upgradeEmail,
      loginProvider: 'phone' // Upgraded to permanent provider
    });
    setIsPhoneLinked(true);
    setShowUpgradeModal(false);
    triggerToast("Account Upgraded Successfully!");
  };

  const isAccountAlreadyLinked = (checkFn: (parsed: any) => boolean): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('ludo_') || key.startsWith('ludo_user_profile_'))) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              const parsed = JSON.parse(val);
              if (parsed && parsed.id && parsed.id !== user?.id && checkFn(parsed)) {
                return true;
              }
            } catch (jsonErr) {}
          }
        }
      }
    } catch (e) {
      console.warn("Error scanning accounts for duplicates:", e);
    }
    return false;
  };

  const handleLinkAccount = async (provider: 'facebook' | 'google' | 'phone') => {
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#FFD700', '#FFA500', '#FFF8DC']
    });

    if (provider === 'google') {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      const isConfigured = googleClientId && !googleClientId.includes('YOUR_GOOGLE_CLIENT_ID');

      if (isConfigured) {
        try {
          triggerGoogleOAuth(googleClientId, (googleProfile) => {
            // Check if already linked to another profile
            const isDup = isAccountAlreadyLinked((acc) => acc.googleId === googleProfile.sub || acc.email === googleProfile.email);
            if (isDup) {
              triggerToast("Error: Google account already linked to another player!");
              return;
            }

            const updated = {
              ...user,
              googleId: googleProfile.sub,
              email: googleProfile.email,
              loginProvider: 'google',
            } as UserProfile;
            updateUser({ googleId: googleProfile.sub, email: googleProfile.email, loginProvider: 'google' });
            
            // Persist as a Google account so user can login with Google later to recover!
            localStorage.setItem(`ludo_google_account`, JSON.stringify(updated));
            localStorage.setItem(`ludo_google_${googleProfile.name.toLowerCase().trim().replace(/\s+/g, '_')}`, JSON.stringify(updated));
            
            setIsGoogleLinked(true);
            triggerToast("Google Linked Successfully!");
          });
        } catch (e) {
          console.warn('Google link popup failed, opening simulated Google link dialog:', e);
          setShowGoogleLinkModal(true);
        }
      } else {
        setShowGoogleLinkModal(true);
      }
    } else if (provider === 'facebook') {
      try {
        const profile = await loginWithFacebook();
        
        // Check if already linked to another profile
        const isDup = isAccountAlreadyLinked((acc) => acc.facebookId === profile.id);
        if (isDup) {
          triggerToast("Error: Facebook account already linked to another player!");
          return;
        }

        const updated = {
          ...user,
          facebookId: profile.id,
          email: profile.email || user?.email,
          loginProvider: 'facebook',
        } as UserProfile;
        updateUser({ facebookId: profile.id, email: profile.email || user?.email, loginProvider: 'facebook' });
        
        localStorage.setItem(`ludo_facebook_account`, JSON.stringify(updated));
        localStorage.setItem(`ludo_facebook_${profile.name.toLowerCase().trim().replace(/\s+/g, '_')}`, JSON.stringify(updated));
        
        setIsFBLinked(true);
        triggerToast("Facebook Linked Successfully!");
      } catch (err) {
        console.warn('Facebook link SDK failed, opening simulated FB link dialog:', err);
        setShowFBLinkModal(true);
      }
    } else if (provider === 'phone') {
      setShowPhoneLinkModal(true);
    }
  };

  const handleSubmitPhoneLink = () => {
    const phoneTrimmed = linkPhoneNumber.trim();
    if (!phoneTrimmed) {
      triggerToast("Please enter your mobile number!");
      return;
    }
    
    // Check if already linked to another profile
    const isDup = isAccountAlreadyLinked((acc) => acc.id === `phone_${phoneTrimmed}` || acc.email === `${phoneTrimmed}@ludophone.com`);
    if (isDup) {
      triggerToast("Error: Mobile number already linked to another player!");
      return;
    }

    const cleanUID = playerUID.replace("LUDO-", "").replace("UID-", "").trim();
    const last6Digits = cleanUID.slice(-6);
    
    if (linkPhoneVerification.trim() !== last6Digits) {
      triggerToast("Invalid Verification Key! Must match the last 6 digits of your UID.");
      return;
    }
    
    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#00E676', '#00C853', '#B9F6CA']
    });
    
    const updated = {
      ...user,
      id: `phone_${phoneTrimmed}`,
      email: `${phoneTrimmed}@ludophone.com`,
      loginProvider: 'phone',
    } as UserProfile;
    
    updateUser({
      id: `phone_${phoneTrimmed}`,
      email: `${phoneTrimmed}@ludophone.com`,
      loginProvider: 'phone',
    });
    
    localStorage.setItem(`ludo_phone_account`, JSON.stringify(updated));
    localStorage.setItem(`ludo_phone_${phoneTrimmed}`, JSON.stringify(updated));
    
    setIsPhoneLinked(true);
    setShowPhoneLinkModal(false);
    triggerToast("Mobile Linked Successfully!");
  };

  const handleSubmitFBLink = () => {
    const finalName = fbLinkName.trim();
    if (!finalName) {
      triggerToast("Please enter your Facebook profile name!");
      return;
    }
    
    // Check if already linked to another profile
    const mockId = `fb_${finalName.toLowerCase().replace(/\s+/g, '_')}`;
    const isDup = isAccountAlreadyLinked((acc) => acc.facebookId === mockId);
    if (isDup) {
      triggerToast("Error: Facebook account already linked to another player!");
      return;
    }

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#1877F2', '#1565C0', '#82B1FF']
    });

    const updated = {
      ...user,
      facebookId: mockId,
      email: `${finalName.toLowerCase().replace(/\s+/g, '')}@facebook.com`,
      loginProvider: 'facebook',
    } as UserProfile;

    updateUser({
      facebookId: mockId,
      email: `${finalName.toLowerCase().replace(/\s+/g, '')}@facebook.com`,
      loginProvider: 'facebook',
    });

    localStorage.setItem(`ludo_facebook_account`, JSON.stringify(updated));
    localStorage.setItem(`ludo_facebook_${finalName.toLowerCase().trim().replace(/\s+/g, '_')}`, JSON.stringify(updated));

    setIsFBLinked(true);
    setShowFBLinkModal(false);
    triggerToast("Facebook Linked Successfully!");
  };

  const handleSubmitGoogleLink = () => {
    const finalEmail = googleLinkEmail.trim().toLowerCase();
    const finalName = googleLinkName.trim();
    
    if (!finalEmail || !finalName) {
      triggerToast("Please enter both email and name!");
      return;
    }
    
    // Check if already linked to another profile
    const mockId = `goog_${finalEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const isDup = isAccountAlreadyLinked((acc) => acc.googleId === mockId || acc.email === finalEmail);
    if (isDup) {
      triggerToast("Error: Google account already linked to another player!");
      return;
    }

    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#EA4335', '#FBBC05', '#34A853', '#4285F4']
    });

    const updated = {
      ...user,
      googleId: mockId,
      email: finalEmail,
      loginProvider: 'google',
    } as UserProfile;

    updateUser({
      googleId: mockId,
      email: finalEmail,
      loginProvider: 'google',
    });

    localStorage.setItem(`ludo_google_account`, JSON.stringify(updated));
    localStorage.setItem(`ludo_google_${finalName.toLowerCase().trim().replace(/\s+/g, '_')}`, JSON.stringify(updated));

    setIsGoogleLinked(true);
    setShowGoogleLinkModal(false);
    triggerToast("Google Linked Successfully!");
  };

  const handleLogoutClick = () => {
    logout();
    onLogout?.();
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="profile" />

      {/* Hidden file input for avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar pb-6">
        {/* Navigation Header */}
        <div className="flex items-center gap-3 w-full mb-5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
          >
            ❮
          </button>
          <h1 className="text-sm font-black tracking-widest bg-gradient-to-r from-purple-300 via-amber-400 to-yellow-400 bg-clip-text text-transparent uppercase">
            Settings
          </h1>
        </div>

        {/* ── CARD 1: PROFILE DETAILS ── */}
        <div className="bg-gradient-to-b from-[#2E0B4E]/90 to-[#1F0736]/90 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl mb-4 relative flex flex-col items-center gap-4 glow-purple-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

          {/* Avatar Frame — matching Home Screen */}
          <div className="relative w-[108px] h-[108px] cursor-pointer" onClick={handleAvatarClick}>
            <div
              className="absolute rounded-full overflow-hidden z-10 bg-slate-950 flex items-center justify-center"
              style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl select-none">👤</span>
              )}
            </div>
            <img
              src="/assets/images/icons/profile_frame_v3.png"
              alt="Profile Frame"
              className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
              draggable={false}
            />
            <div className="absolute bottom-[28px] right-[18px] z-30 bg-amber-500 text-slate-950 rounded-full w-[22px] h-[22px] flex items-center justify-center shadow-lg border border-amber-200 hover:scale-110 active:scale-95 transition-all text-[10px]">
              📷
            </div>
          </div>

          {/* Name Banner — matching Home Screen */}
          <div className="relative w-[124px] -mt-[14px] flex flex-col items-center justify-center mb-1">
            <img
              src="/assets/images/icons/name_banner_v2.png"
              alt="Name Banner"
              className="w-full h-auto object-contain pointer-events-none"
              draggable={false}
            />
            <span 
              className={`absolute inset-0 flex items-center justify-center font-black text-amber-200 tracking-wider drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] pointer-events-none px-2 text-center overflow-hidden truncate max-w-[90%] ${
                playerName.length <= 8 ? 'text-[9.5px]' : playerName.length <= 12 ? 'text-[8.5px]' : 'text-[7.5px]'
              }`}
            >
              {playerName}
            </span>
          </div>

          <div className="w-full flex flex-col gap-3">
            {/* Display Name Row */}
            <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
              <div className="flex flex-col">
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Profile Name</span>
                <span className="text-sm font-black text-white">{playerName}</span>
              </div>
              <button
                onClick={() => {
                  setNewName(playerName);
                  setShowEditName(true);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-transform uppercase"
              >
                Edit Name
              </button>
            </div>

            {/* UID Row */}
            <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
              <div className="flex flex-col">
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Player ID / UID</span>
                <span className="text-xs font-black text-amber-300 font-mono tracking-wider">{playerUID}</span>
              </div>
              <button
                onClick={handleCopyUID}
                className="px-3.5 py-1.5 bg-purple-800 text-white font-black text-[10px] rounded-xl border border-purple-500 hover:bg-purple-700 active:scale-95 transition-transform uppercase"
              >
                UID Copy
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 2: ACCOUNT SECURITY ── */}
        <div className="bg-gradient-to-b from-[#2E0B4E]/90 to-[#1F0736]/90 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl mb-4 relative glow-purple-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
          
          <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🔒</span> Account Security
          </h3>

          <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
            <div className="flex flex-col">
              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider font-sans">Password</span>
              <span className="text-sm font-black text-white tracking-widest font-mono">••••••••</span>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-1.5 bg-purple-800 text-white font-black text-[10px] rounded-xl border border-purple-500 hover:bg-purple-700 active:scale-95 transition-transform uppercase"
            >
              Change
            </button>
          </div>
        </div>

        {/* ── CARD 3: LINKED ACCOUNTS ── */}
        <div className="bg-gradient-to-b from-[#2E0B4E]/90 to-[#1F0736]/90 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl mb-4 relative glow-purple-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>

          <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🔗</span> Linked Accounts
          </h3>

          <div className="space-y-2.5">
            {/* Facebook Link Row */}
            <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📘</span>
                <span className="text-xs font-black text-white">Facebook</span>
              </div>
              {isFBLinked ? (
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Linked ✓</span>
              ) : (
                <button
                  onClick={() => handleLinkAccount('facebook')}
                  className="px-3.5 py-1.5 bg-[#1877F2] text-white font-black text-[10px] rounded-xl hover:bg-blue-600 active:scale-95 transition-transform uppercase"
                >
                  Link
                </button>
              )}
            </div>

            {/* Google Link Row */}
            <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔴</span>
                <span className="text-xs font-black text-white">Google</span>
              </div>
              {isGoogleLinked ? (
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Linked ✓</span>
              ) : (
                <button
                  onClick={() => handleLinkAccount('google')}
                  className="px-3.5 py-1.5 bg-red-600 text-white font-black text-[10px] rounded-xl hover:bg-red-700 active:scale-95 transition-transform uppercase"
                >
                  Link
                </button>
              )}
            </div>

            {/* Guest Upgrade Option */}
            {user?.loginProvider === 'guest' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[11px] tracking-wider rounded-2xl border border-amber-300 hover:scale-[1.01] active:scale-95 transition-transform uppercase"
              >
                Guest Account Upgrade 💎
              </button>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="w-full mt-2 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl text-white font-black text-xs tracking-widest uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all border border-red-400"
        >
          Logout Account
        </button>
      </div>

      {/* ── MODAL 1: EDIT NAME OVERLAY ── */}
      {showEditName && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative">
            <button
              onClick={() => setShowEditName(false)}
              className="absolute top-3 right-4 text-amber-300 text-lg font-black hover:text-white"
            >
              ✕
            </button>
            <div className="text-center">
              <span className="text-3xl">✏️</span>
              <h3 className="text-base font-black text-amber-300 tracking-wider mt-1 uppercase">Edit Profile Name</h3>
              <p className="text-[10px] text-purple-300/80">Enter your new username in uppercase</p>
            </div>
            <input
              type="text"
              maxLength={15}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Username..."
              className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-black text-sm text-center uppercase focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSaveName}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-xs tracking-widest uppercase rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              Save Username
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CHANGE PASSWORD OVERLAY ── */}
      {showChangePassword && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative">
            <button
              onClick={() => setShowChangePassword(false)}
              className="absolute top-3 right-4 text-amber-300 text-lg font-black hover:text-white"
            >
              ✕
            </button>
            <div className="text-center">
              <span className="text-3xl">🔒</span>
              <h3 className="text-base font-black text-amber-300 tracking-wider mt-1 uppercase">Change Password</h3>
              <p className="text-[10px] text-purple-300/80">Update your account security key</p>
            </div>
            <div className="space-y-2">
              <input
                type="password"
                value={currPassword}
                onChange={(e) => setCurrPassword(e.target.value)}
                placeholder="Current Password..."
                className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password..."
                className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password..."
                className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              onClick={handleChangePasswordSubmit}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-xs tracking-widest uppercase rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              Update Security Key
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 3: GUEST UPGRADE OVERLAY ── */}
      {showUpgradeModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-3 right-4 text-amber-300 text-lg font-black hover:text-white"
            >
              ✕
            </button>
            <div className="text-center">
              <span className="text-3xl">💎</span>
              <h3 className="text-base font-black text-amber-300 tracking-wider mt-1 uppercase">Upgrade Guest Account</h3>
              <p className="text-[10px] text-purple-300/80">Link your email to keep your coins and rank forever</p>
            </div>
            <div className="space-y-2">
              <input
                type="email"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                placeholder="Enter Email Address..."
                className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
              <input
                type="password"
                value={upgradePassword}
                onChange={(e) => setUpgradePassword(e.target.value)}
                placeholder="Choose Password..."
                className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              onClick={handleUpgradeAccount}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-xs tracking-widest uppercase rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              Link & Upgrade
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 4: PHONE LINK OVERLAY ── */}
      {showPhoneLinkModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative">
            <button
              onClick={() => setShowPhoneLinkModal(false)}
              className="absolute top-3 right-4 text-amber-300 text-lg font-black hover:text-white"
            >
              ✕
            </button>
            <div className="text-center">
              <span className="text-3xl">📱</span>
              <h3 className="text-base font-black text-amber-300 tracking-wider mt-1 uppercase">Link Mobile Account</h3>
              <p className="text-[10px] text-purple-300/80">Enter mobile number and UID verification key</p>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-purple-300 uppercase tracking-wider">Mobile Number</span>
                <input
                  type="tel"
                  value={linkPhoneNumber}
                  onChange={(e) => setLinkPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 10-digit number..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-purple-300 uppercase tracking-wider">Verification Key</span>
                  <span className="text-[8px] font-black text-amber-400 uppercase">Last 6 digits of UID</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={linkPhoneVerification}
                  onChange={(e) => setLinkPhoneVerification(e.target.value.trim())}
                  placeholder="Enter last 6 digits of UID..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400 text-center tracking-widest"
                />
              </div>
            </div>
            <button
              onClick={handleSubmitPhoneLink}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-xs tracking-widest uppercase rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              Verify & Link Mobile
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 5: SIMULATED FACEBOOK LINK OVERLAY ── */}
      {showFBLinkModal && (
        <div className="absolute inset-0 z-50 bg-[#090214]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-[#1877F2] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-blue-400">
            {/* Header */}
            <div className="bg-[#1877F2] p-4 flex items-center gap-3 border-b border-blue-500">
              <span className="text-white text-2xl font-black font-serif select-none">facebook</span>
              <span className="text-[10px] bg-blue-800 text-blue-100 px-2 py-0.5 rounded font-black tracking-wider uppercase ml-auto">OAuth 2.0</span>
            </div>

            {/* Content Body */}
            <div className="bg-[#1C202E] p-5 flex flex-col gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-xl border border-purple-500">
                  🎲
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Ludo Enterprise</h4>
                  <p className="text-[10px] text-gray-400">developers.facebook.com</p>
                </div>
              </div>

              <div className="text-xs text-gray-300 leading-relaxed border-t border-b border-gray-800 py-3 my-1">
                Confirm your identity to link your **Facebook account** to this profile.
              </div>

              <div className="flex flex-col gap-2 bg-[#141724] p-3 rounded-2xl border border-blue-800">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Facebook Verification</span>
                <input
                  type="text"
                  value={fbLinkName}
                  onChange={(e) => setFbLinkName(e.target.value)}
                  placeholder="Enter your Facebook profile name..."
                  className="w-full px-3 py-2 bg-black/60 border border-blue-700/50 rounded-xl text-white placeholder-gray-500 font-bold text-xs focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => setShowFBLinkModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xs uppercase rounded-xl transition-transform active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFBLink}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-[#1877F2] hover:from-blue-700 hover:to-blue-600 text-white font-black text-xs uppercase rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  Verify & Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: SIMULATED GOOGLE LINK OVERLAY ── */}
      {showGoogleLinkModal && (
        <div className="absolute inset-0 z-50 bg-[#090214]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative">
            <button
              onClick={() => setShowGoogleLinkModal(false)}
              className="absolute top-3 right-4 text-amber-300 text-lg font-black hover:text-white"
            >
              ✕
            </button>
            <div className="text-center">
              <span className="text-3xl">🔴</span>
              <h3 className="text-base font-black text-amber-300 tracking-wider mt-1 uppercase">Link Google Account</h3>
              <p className="text-[10px] text-purple-300/80">Confirm your identity to link your **Google account**</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-purple-300 uppercase tracking-wider">Email Address</span>
                <input
                  type="email"
                  value={googleLinkEmail}
                  onChange={(e) => setGoogleLinkEmail(e.target.value)}
                  placeholder="Enter your Gmail address..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-purple-300 uppercase tracking-wider">Display Name</span>
                <input
                  type="text"
                  value={googleLinkName}
                  onChange={(e) => setGoogleLinkName(e.target.value)}
                  placeholder="Enter your Google profile name..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/40 font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setShowGoogleLinkModal(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xs uppercase rounded-xl transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGoogleLink}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-black text-xs uppercase rounded-xl shadow-lg transition-transform active:scale-95 border border-red-400"
              >
                Verify & Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM FLOATING TOAST BAR ── */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-2.5 bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-800 border-2 border-amber-400/80 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.8)] flex items-center justify-center animate-bounce">
          <span className="text-[10px] font-black text-amber-300 tracking-wider uppercase select-none">
            ✨ {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
};
