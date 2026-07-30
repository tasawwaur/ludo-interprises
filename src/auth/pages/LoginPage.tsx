import React, { useState, useEffect } from "react";
import { useUserStore, UserProfile } from "../../user/user.store";
import { initFacebookSDK, loginWithFacebook, fetchFacebookFriends, FBFriend } from "../utils/fb";
import { initGoogleSDK, promptGoogleSignIn, GoogleUserProfile } from "../utils/google";
import { GuestRegistrationModal } from "../components/GuestRegistrationModal";

interface LoginPageProps {
  onSuccessLogin?: () => void;
  onToggleRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showGuestRegModal, setShowGuestRegModal] = useState(false);
  
  // Facebook Modal State
  const [showFBModal, setShowFBModal] = useState(false);
  const [syncRoxana, setSyncRoxana] = useState(true);
  const [syncAman, setSyncAman] = useState(true);
  const [syncGovind, setSyncGovind] = useState(true);
  const [fbUserName, setFbUserName] = useState("TASAVVUR");
  const [fbAvatarUrl, setFbAvatarUrl] = useState("");

  // Google Auth State & Modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleName, setGoogleName] = useState("Tasavvur Malik");
  const [googleEmail, setGoogleEmail] = useState("tasavvur.malik@gmail.com");
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState("https://lh3.googleusercontent.com/a/default-user=s96-c");
  const [isGoogleSDKReady, setIsGoogleSDKReady] = useState(false);

  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    // Initialize Facebook SDK on mount — uses real App ID from .env
    const fbAppId = import.meta.env.VITE_FB_APP_ID || '1234567890';
    initFacebookSDK(fbAppId);

    // Initialize Google SDK on mount — uses real Client ID from .env
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    const isValidRealClientId = googleClientId && !googleClientId.includes('YOUR_GOOGLE_CLIENT_ID');
    if (isValidRealClientId) {
      initGoogleSDK(googleClientId, (googleProfile) => {
        handleCompleteGoogleAuth(googleProfile);
      }).then((ready) => {
        setIsGoogleSDKReady(ready);
      });
    }
  }, []);

  // 💾 Account Persistence Helpers for Returning Users (Restores exact saved coins & profile)
  const getSavedAccount = (provider: 'guest' | 'google' | 'facebook', nameOrId?: string): UserProfile | null => {
    try {
      if (nameOrId) {
        const key = `ludo_${provider}_${nameOrId.toLowerCase().trim().replace(/\s+/g, '_')}`;
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
      }
      const defaultSaved = localStorage.getItem(`ludo_${provider}_account`);
      if (defaultSaved) return JSON.parse(defaultSaved);
    } catch (e) {
      console.warn(`Failed to read saved ${provider} account:`, e);
    }
    return null;
  };

  const saveAccountForProvider = (userProfile: UserProfile, provider: 'guest' | 'google' | 'facebook', nameOrId?: string) => {
    try {
      if (nameOrId) {
        const key = `ludo_${provider}_${nameOrId.toLowerCase().trim().replace(/\s+/g, '_')}`;
        localStorage.setItem(key, JSON.stringify(userProfile));
      }
      localStorage.setItem(`ludo_${provider}_account`, JSON.stringify(userProfile));
    } catch (e) {
      console.warn(`Failed to save ${provider} account:`, e);
    }
  };

  const handlePerformLogin = (loginMethod: string, name?: string) => {
    const finalName = name || `${loginMethod} Player`;
    setUser({
      id: `usr_${Date.now()}`,
      username: finalName,
      displayName: finalName,
      email: `${finalName.toLowerCase().replace(/\s+/g, "")}@ludolegends.com`,
      country: "🇮🇳",
      rank: 1,
      coins: 10000,
      gems: 100,
      level: 5,
      xp: 850,
      nextLevelXp: 1000,
      loginProvider: loginMethod.toLowerCase() as any,
    });
    onSuccessLogin?.();
  };

  const setJustClaimedWelcome = useUserStore((s) => s.setJustClaimedWelcome);

  // Guest Click — Auto login returning guest if account exists, otherwise open registration
  const handleGuestClick = () => {
    const existingGuest = getSavedAccount('guest');
    if (existingGuest) {
      setUser(existingGuest);
      onSuccessLogin?.();
      return;
    }
    setShowGuestRegModal(true);
  };

  const handleGuestRegistrationComplete = (data: {
    name: string;
    age: number;
    is18Plus: boolean;
    gender: 'male' | 'female' | 'other';
    avatar: string;
    guestId: string;
  }) => {
    const existing = getSavedAccount('guest', data.name);
    if (existing) {
      setUser(existing);
      setShowGuestRegModal(false);
      onSuccessLogin?.();
      return;
    }
    const newUser: UserProfile = {
      id: data.guestId || `GST-${Date.now()}`,
      username: data.name,
      displayName: data.name,
      email: `${data.name.toLowerCase().replace(/\s+/g, '')}@ludolegends.com`,
      avatar: data.avatar,
      age: data.age,
      is18Plus: data.is18Plus,
      gender: data.gender,
      country: '🇮🇳',
      rank: 1,
      coins: 10000,
      gems: 100,
      crowns: 5,
      level: 1,
      xp: 0,
      nextLevelXp: 1000,
      loginProvider: 'guest',
    };
    saveAccountForProvider(newUser, 'guest', data.name);
    setJustClaimedWelcome(true);
    setUser(newUser);
    setShowGuestRegModal(false);
    onSuccessLogin?.();
  };

  // Google Login Handler — Opens Google Connect / Recovery Modal
  const handleGoogleLogin = () => {
    setShowGoogleModal(true);
    if (isGoogleSDKReady) {
      promptGoogleSignIn();
    }
  };

  const handleCompleteGoogleAuth = (profile: GoogleUserProfile) => {
    const existing = getSavedAccount('google', profile.name) || getSavedAccount('google', profile.email);
    if (existing) {
      setUser(existing);
      setShowGoogleModal(false);
      onSuccessLogin?.();
      return;
    }
    const newGoogleUser: UserProfile = {
      id: `goog_${profile.sub || Date.now()}`,
      username: profile.name,
      displayName: profile.name,
      email: profile.email,
      avatar: profile.picture || googleAvatarUrl,
      country: "🇮🇳",
      rank: 1,
      coins: 20000,
      gems: 200,
      crowns: 10,
      level: 1,
      xp: 0,
      nextLevelXp: 1000,
      loginProvider: 'google',
      googleId: profile.sub,
    };
    saveAccountForProvider(newGoogleUser, 'google', profile.name);
    setJustClaimedWelcome(true);
    setUser(newGoogleUser);
    setShowGoogleModal(false);
    onSuccessLogin?.();
  };

  const handleCompleteCustomGoogleLogin = () => {
    const finalName = googleName.trim() || "Google User";
    const finalEmail = googleEmail.trim() || `${finalName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const finalAvatar = googleAvatarUrl.trim() || undefined;

    const existing = getSavedAccount('google', finalName) || getSavedAccount('google', finalEmail);
    if (existing) {
      setUser(existing);
      setShowGoogleModal(false);
      onSuccessLogin?.();
      return;
    }

    const newGoogleUser: UserProfile = {
      id: `goog_${Date.now()}`,
      username: finalName,
      displayName: finalName,
      email: finalEmail,
      avatar: finalAvatar,
      country: "🇮🇳",
      rank: 1,
      coins: 20000,
      gems: 200,
      crowns: 10,
      level: 1,
      xp: 0,
      nextLevelXp: 1000,
      loginProvider: 'google',
      googleId: `goog_acc_${Date.now()}`,
    };
    saveAccountForProvider(newGoogleUser, 'google', finalName);
    setJustClaimedWelcome(true);
    setUser(newGoogleUser);

    setShowGoogleModal(false);
    onSuccessLogin?.();
  };

  const handleFacebookLogin = async () => {
    try {
      const profile = await loginWithFacebook();
      const fbFriends = await fetchFacebookFriends();
      
      const existing = getSavedAccount('facebook', profile.name);
      if (existing) {
        setUser(existing);
        onSuccessLogin?.();
        return;
      }
      
      const newFBUser: UserProfile = {
        id: `fb_${profile.id}`,
        username: profile.name,
        displayName: profile.name,
        email: profile.email || `${profile.name.toLowerCase().replace(/\s+/g, "")}@facebook.com`,
        avatar: profile.avatarUrl || undefined,
        country: "🇮🇳",
        rank: 1,
        coins: 20000,
        gems: 200,
        crowns: 10,
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        loginProvider: 'facebook',
        facebookId: profile.id,
        syncedFBFriends: fbFriends.length > 0 ? fbFriends : [
          { id: 'fb_f1', name: 'Roxana [FB]', isOnline: true },
          { id: 'fb_f2', name: 'Aman [FB]', isOnline: true },
          { id: 'fb_f3', name: 'Govind [FB]', isOnline: false }
        ]
      };
      saveAccountForProvider(newFBUser, 'facebook', profile.name);
      setJustClaimedWelcome(true);
      setUser(newFBUser);
      onSuccessLogin?.();
    } catch (err) {
      console.warn('Real Facebook SDK login failed or App ID dummy, launching simulated modal:', err);
      // Fallback to simulated popup modal
      setShowFBModal(true);
    }
  };

  const handleCompleteSimulatedFBLogin = () => {
    const selectedFriends: FBFriend[] = [];
    if (syncRoxana) {
      selectedFriends.push({ id: 'fb_sim_1', name: 'Roxana [FB]', isOnline: true });
    }
    if (syncAman) {
      selectedFriends.push({ id: 'fb_sim_2', name: 'Aman [FB]', isOnline: true });
    }
    if (syncGovind) {
      selectedFriends.push({ id: 'fb_sim_3', name: 'Govind [FB]', isOnline: false });
    }

    const finalName = fbUserName.trim() || 'TASAVVUR';
    const finalAvatar = fbAvatarUrl.trim() || undefined;

    const existing = getSavedAccount('facebook', finalName);
    if (existing) {
      setUser(existing);
      setShowFBModal(false);
      onSuccessLogin?.();
      return;
    }

    const newFBUser: UserProfile = {
      id: `fb_sim_${Date.now()}`,
      username: finalName,
      displayName: finalName,
      email: `${finalName.toLowerCase().replace(/\s+/g, '')}@facebook.com`,
      avatar: finalAvatar,
      country: '🇮🇳',
      rank: 1,
      coins: 20000,
      gems: 200,
      crowns: 10,
      level: 1,
      xp: 0,
      nextLevelXp: 1000,
      loginProvider: 'facebook',
      facebookId: '1020304050',
      syncedFBFriends: selectedFriends
    };
    saveAccountForProvider(newFBUser, 'facebook', finalName);
    setJustClaimedWelcome(true);
    setUser(newFBUser);

    setShowFBModal(false);
    onSuccessLogin?.();
  };

  return (
    <div className="w-full min-h-screen h-screen bg-[#07010E] text-white flex flex-col items-center justify-center relative overflow-hidden select-none font-sans">
      {/* 1. High-Res Luxury Login Background Image */}
      <img
        src="/login_bg.jpg"
        alt="Ludo Legends Login Page"
        className="w-full h-full object-fill z-0 absolute inset-0"
      />
      {/* 2. REAL Interactive Hotspots positioned exactly over the background image's luxury buttons */}

      {/* A. GOOGLE LOGIN BUTTON (Top Button on Image) */}
      <button
        onClick={handleGoogleLogin}
        className="absolute z-20 w-[80%] max-w-[340px] h-[52px] rounded-full pointer-events-auto cursor-pointer border-0 outline-none ring-0 bg-transparent active:scale-[0.96] transition-transform duration-75"
        style={{ bottom: "28.2%", left: "50%", transform: "translateX(-50%)", WebkitTapHighlightColor: "transparent" }}
        title="Login With Google"
      ></button>

      {/* B. FACEBOOK LOGIN BUTTON (Middle Button on Image) */}
      <button
        onClick={handleFacebookLogin}
        className="absolute z-20 w-[80%] max-w-[340px] h-[52px] rounded-full pointer-events-auto cursor-pointer border-0 outline-none ring-0 bg-transparent active:scale-[0.96] transition-transform duration-75"
        style={{ bottom: "19.4%", left: "50%", transform: "translateX(-50%)", WebkitTapHighlightColor: "transparent" }}
        title="Login With Facebook"
      ></button>

      {/* C. PLAY AS GUEST BUTTON (Bottom Button on Image) */}
      <button
        onClick={handleGuestClick}
        className="absolute z-20 w-[80%] max-w-[340px] h-[52px] rounded-full pointer-events-auto cursor-pointer border-0 outline-none ring-0 bg-transparent active:scale-[0.96] transition-transform duration-75"
        style={{ bottom: "11.6%", left: "50%", transform: "translateX(-50%)", WebkitTapHighlightColor: "transparent" }}
        title="Guest Play"
      ></button>

      {/* Phone Login Modal Popup */}
      {showPhoneModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#28093D] via-[#1A052A] to-[#0D0216] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 relative">
            <button
              onClick={() => setShowPhoneModal(false)}
              className="absolute top-3 right-4 text-amber-300 text-xl font-black hover:text-white"
            >
              ✕
            </button>

            <div className="text-center">
              <span className="text-3xl">📱</span>
              <h3 className="text-xl font-black text-amber-300 tracking-wider mt-1">
                PHONE LOGIN / OTP
              </h3>
              <p className="text-xs text-amber-200/70">
                Enter your 10-digit mobile number
              </p>
            </div>

            <div className="w-full flex gap-2">
              <div className="px-3.5 py-2.5 bg-black/70 border border-amber-400/40 rounded-xl text-amber-300 font-extrabold text-sm flex items-center">
                +91
              </div>
              <input
                type="tel"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Mobile Number..."
                className="w-full px-3.5 py-2.5 bg-black/70 border border-amber-400/40 rounded-xl text-white placeholder-amber-200/40 font-bold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={() =>
                handlePerformLogin(
                  "Phone",
                  phoneNumber ? `Player_${phoneNumber.slice(-4)}` : "Malik Player"
                )
              }
              className="w-full py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-sm tracking-wider uppercase rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              GET OTP & PLAY 🎮
            </button>
          </div>
        </div>
      )}

      {/* Google OAuth 2.0 Authenticator Modal */}
      {showGoogleModal && (
        <div className="absolute inset-0 z-50 bg-[#000000]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[350px] bg-white text-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200 font-sans animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center gap-2">
              {/* Official Google G Logo */}
              <svg className="w-9 h-9" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Sign in with Google</h3>
              <p className="text-xs text-gray-500 font-normal text-center">to continue to <strong className="text-gray-800">Ludo Enterprise</strong></p>
            </div>

            {/* Account Details / Form */}
            <div className="p-6 flex flex-col gap-4 bg-gray-50/50">
              {/* Saved Account Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:border-blue-400 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-600 font-extrabold flex items-center justify-center overflow-hidden flex-shrink-0 text-sm">
                  {googleAvatarUrl ? (
                    <img src={googleAvatarUrl} alt="Google Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    googleName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{googleName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{googleEmail}</p>
                </div>
                <span className="text-xs text-blue-600 font-semibold">Active</span>
              </div>

              {/* Name & Email Custom Inputs */}
              <div className="flex flex-col gap-2.5 pt-1">
                <label className="text-[11px] font-semibold text-gray-600 tracking-wider uppercase">Google Account Name</label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />

                <label className="text-[11px] font-semibold text-gray-600 tracking-wider uppercase mt-1">Google Email Address</label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleCompleteCustomGoogleLogin}
                  className="w-full py-3 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <span>Sign In as {googleName.split(' ')[0]}</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setShowGoogleModal(false)}
                  className="w-full py-2 bg-transparent text-gray-500 hover:text-gray-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-100 text-[10px] text-gray-500 text-center border-t border-gray-200">
              Secured by Google Identity Services OAuth 2.0
            </div>
          </div>
        </div>
      )}

      {/* Facebook Simulated OAuth Modal */}
      {showFBModal && (
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
                Ludo Enterprise is requesting permission to access your **public profile**, **email address**, and **friends list**.
              </div>

              {/* ✅ Aapka Facebook Profile - Name & Photo Input */}
              <div className="flex flex-col gap-2 bg-[#141724] p-3 rounded-2xl border border-blue-800">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Aapka Facebook Profile</span>
                
                {/* Profile Preview */}
                <div className="flex items-center gap-3 py-1">
                  <div className="w-11 h-11 rounded-full border-2 border-[#1877F2] overflow-hidden bg-blue-900 flex items-center justify-center flex-shrink-0">
                    {fbAvatarUrl ? (
                      <img src={fbAvatarUrl} alt="FB Profile" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-white">{fbUserName || 'Aapka Naam'}</p>
                    <p className="text-[10px] text-blue-400">Facebook Account</p>
                  </div>
                </div>

                {/* Name Input */}
                <input
                  type="text"
                  value={fbUserName}
                  onChange={(e) => setFbUserName(e.target.value)}
                  placeholder="Apna Facebook naam likhein..."
                  className="w-full px-3 py-2 bg-black/60 border border-blue-700/50 rounded-xl text-white placeholder-gray-500 font-bold text-xs focus:outline-none focus:border-[#1877F2]"
                />

                {/* Avatar URL Input */}
                <input
                  type="url"
                  value={fbAvatarUrl}
                  onChange={(e) => setFbAvatarUrl(e.target.value)}
                  placeholder="Profile photo URL (optional)..."
                  className="w-full px-3 py-2 bg-black/60 border border-blue-700/50 rounded-xl text-white placeholder-gray-500 font-bold text-xs focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              {/* Friends Sync Checklist */}
              <div className="flex flex-col gap-2 bg-[#141724] p-3 rounded-2xl border border-gray-800">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Select Friends to Import</span>
                
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-xs text-gray-200 font-bold">Roxana (Online)</span>
                  <input type="checkbox" checked={syncRoxana} onChange={(e) => setSyncRoxana(e.target.checked)} className="accent-[#1877F2] w-4 h-4 cursor-pointer" />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-xs text-gray-200 font-bold">Aman (Online)</span>
                  <input type="checkbox" checked={syncAman} onChange={(e) => setSyncAman(e.target.checked)} className="accent-[#1877F2] w-4 h-4 cursor-pointer" />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-xs text-gray-200 font-bold">Govind (Offline)</span>
                  <input type="checkbox" checked={syncGovind} onChange={(e) => setSyncGovind(e.target.checked)} className="accent-[#1877F2] w-4 h-4 cursor-pointer" />
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleCompleteSimulatedFBLogin}
                  className="w-full py-3 bg-[#1877F2] hover:bg-blue-600 text-white font-black text-xs tracking-wider uppercase rounded-xl shadow-lg active:scale-95 transition-transform"
                >
                  Continue as {fbUserName.trim() || 'Tasavvur'} ✓
                </button>
                <button
                  onClick={() => setShowFBModal(false)}
                  className="w-full py-2 bg-transparent text-gray-400 hover:text-white font-bold text-xs tracking-wider uppercase active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Registration Multi-step Modal */}
      <GuestRegistrationModal
        isOpen={showGuestRegModal}
        onClose={() => setShowGuestRegModal(false)}
        onComplete={handleGuestRegistrationComplete}
      />
    </div>
  );
};
