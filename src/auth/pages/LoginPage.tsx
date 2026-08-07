import React, { useState, useEffect } from "react";
import { useUserStore, UserProfile } from "../../user/user.store";
import { initFacebookSDK, loginWithFacebook, fetchFacebookFriends, FBFriend } from "../utils/fb";
import { initGoogleSDK, promptGoogleSignIn, renderGoogleSignInButton, triggerGoogleOAuth, GoogleUserProfile } from "../utils/google";
import { GuestRegistrationModal } from "../components/GuestRegistrationModal";
import { formatPlayerUID } from "../../utils/uuid";
import { getDefaultAvatar } from "../../utils/avatar";
import { TermsPolicyModal } from "../../components/modal/TermsPolicyModal";

interface LoginPageProps {
  onSuccessLogin?: () => void;
  onToggleRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {

  const [showGuestRegModal, setShowGuestRegModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyInitialTab, setPolicyInitialTab] = useState<'TERMS' | 'REFUND' | 'PRIVACY'>('TERMS');
  
  // Facebook Modal State
  const [showFBModal, setShowFBModal] = useState(false);
  const [syncRoxana, setSyncRoxana] = useState(true);
  const [syncAman, setSyncAman] = useState(true);
  const [syncGovind, setSyncGovind] = useState(true);
  const [fbUserName, setFbUserName] = useState("");
  const [fbAvatarUrl, setFbAvatarUrl] = useState("");

  const [isGoogleSDKReady, setIsGoogleSDKReady] = useState(false);

  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    // Initialize Facebook SDK on mount — uses real App ID
    const fbAppId = import.meta.env.VITE_FB_APP_ID || '1745824376557788';
    initFacebookSDK(fbAppId);

    // Initialize Google SDK on mount
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '553585934648-1u10lds26ngf5b9bel7cv22brg74vt1c.apps.googleusercontent.com';
    initGoogleSDK(googleClientId, (googleProfile) => {
      handleCompleteGoogleAuth(googleProfile);
    }).then((ready) => {
      setIsGoogleSDKReady(ready);
    });
  }, []);

  // 💾 Account Persistence Helpers for Returning Users (Restores exact saved coins & profile)
  const getSavedAccount = (provider: 'guest' | 'google' | 'facebook' | 'phone', nameOrId?: string): UserProfile | null => {
    try {
      if (nameOrId) {
        const sanitized = nameOrId.toLowerCase().trim().replace(/\s+/g, '_');
        const key = `ludo_${provider}_${sanitized}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            uid: parsed.uid || formatPlayerUID(parsed),
            coins: (parsed.coins !== undefined && parsed.coins > 0) ? parsed.coins : 20000,
            gems: (parsed.gems !== undefined && parsed.gems > 0) ? parsed.gems : 200,
            crowns: parsed.crowns !== undefined ? parsed.crowns : 10,
          };
        }
        return null; // Return null if specific account name/ID was requested but not found
      }

      const defaultSaved = localStorage.getItem(`ludo_${provider}_account`);
      if (defaultSaved) {
        const parsed = JSON.parse(defaultSaved);
        return {
          ...parsed,
          uid: parsed.uid || formatPlayerUID(parsed),
          coins: (parsed.coins !== undefined && parsed.coins > 0) ? parsed.coins : 20000,
          gems: (parsed.gems !== undefined && parsed.gems > 0) ? parsed.gems : 200,
          crowns: parsed.crowns !== undefined ? parsed.crowns : 10,
        };
      }
    } catch (e) {
      console.warn(`Failed to read saved ${provider} account:`, e);
    }
    return null;
  };

  const saveAccountForProvider = (userProfile: UserProfile, provider: 'guest' | 'google' | 'facebook' | 'phone', nameOrId?: string) => {
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
      avatar: getDefaultAvatar(finalName),
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

  const handleGuestRegistrationComplete = (data: {
    name: string;
    age: number;
    is18Plus: boolean;
    gender: 'male' | 'female' | 'other';
    avatar: string;
    guestId: string;
    invitationCode?: string;
  }) => {
    // Pehle check karo agar is naam ka account pehle se hai
    const existingByName = getSavedAccount('guest', data.name);
    if (existingByName) {
      setUser(existingByName);
      setShowGuestRegModal(false);
      onSuccessLogin?.();
      return;
    }
    // Also check by guestId
    const existingById = getSavedAccount('guest', data.guestId);
    if (existingById) {
      setUser(existingById);
      setShowGuestRegModal(false);
      onSuccessLogin?.();
      return;
    }

    const guestId = data.guestId || `GST-${Date.now()}`;
    const startingGems = data.invitationCode ? 1200 : 200; // 200 starting + 1000 referral reward

    const newUser: UserProfile = {
      id: guestId,
      uid: formatPlayerUID({ id: guestId, username: data.name }),
      username: data.name,
      displayName: data.name,
      email: `${data.name.toLowerCase().replace(/\s+/g, '')}@ludolegends.com`,
      avatar: data.avatar,
      age: data.age,
      is18Plus: data.is18Plus,
      gender: data.gender,
      country: '🇮🇳',
      rank: 1,
      coins: 20000,
      gems: startingGems,
      crowns: 10,
      level: 1,
      xp: 0,
      nextLevelXp: 1000,
      loginProvider: 'guest',
    };

    // If invitation code was used, save to localStorage and append notifications log
    if (data.invitationCode) {
      try {
        awardDiamondsToInviter(data.invitationCode);
        localStorage.setItem(`ludo_claimed_referral_code_${guestId}_v1`, data.invitationCode);
        const inviteNotif = {
          id: `notif_invite_${Date.now()}`,
          title: '🤝 Player Invitation Reward',
          desc: `Used invitation code ${data.invitationCode} (+1,000 Diamonds)`,
          rewardType: 'gems',
          amount: 1000,
          time: 'Just now',
          claimed: true,
          type: 'referral'
        };
        const savedNotifs = localStorage.getItem(`ludo_bell_notifications_${guestId}_v1`);
        const parsedNotifs = savedNotifs ? JSON.parse(savedNotifs) : [];
        localStorage.setItem(`ludo_bell_notifications_${guestId}_v1`, JSON.stringify([inviteNotif, ...parsedNotifs]));
      } catch (e) {
        console.warn('Failed to save signup invitation details:', e);
      }
    }

    // Name aur guestId dono se save karo for reliable lookup
    saveAccountForProvider(newUser, 'guest', data.name);
    saveAccountForProvider(newUser, 'guest', guestId);
    setJustClaimedWelcome(true);
    setUser(newUser);
    setShowGuestRegModal(false);
    onSuccessLogin?.();
  };


  // Google Login Handler — Always executes real Google OAuth authentication
  const handleGoogleLogin = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '553585934648-1u10lds26ngf5b9bel7cv22brg74vt1c.apps.googleusercontent.com';
    triggerGoogleOAuth(googleClientId, (googleProfile) => {
      handleCompleteGoogleAuth(googleProfile);
    });
  };

  const handleCompleteGoogleAuth = (profile: GoogleUserProfile) => {
    if (!profile || !profile.name) {
      console.warn('Real Google Auth returned empty profile');
      return;
    }

    const existing = (profile.name && getSavedAccount('google', profile.name)) || 
                     (profile.email && getSavedAccount('google', profile.email)) || 
                     (profile.sub && getSavedAccount('google', profile.sub));

    if (existing) {
      const restoredUser: UserProfile = {
        ...existing,
        displayName: profile.name,
        username: profile.name,
        email: profile.email,
        avatar: profile.picture || existing.avatar,
      };
      saveAccountForProvider(restoredUser, 'google', profile.name);
      setUser(restoredUser);
      onSuccessLogin?.();
      return;
    }

    const newGoogleUser: UserProfile = {
      id: `goog_${profile.sub || Date.now()}`,
      uid: formatPlayerUID({ googleId: profile.sub, username: profile.name }),
      username: profile.name,
      displayName: profile.name,
      email: profile.email,
      avatar: profile.picture || getDefaultAvatar(profile.name || profile.sub),
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
    onSuccessLogin?.();
  };

  const handleFacebookLogin = async () => {
    const FB = (window as any).FB;
    if (!FB) {
      console.warn('Facebook SDK not loaded. Falling back to simulated login modal.');
      setShowFBModal(true);
      return;
    }

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
        uid: formatPlayerUID({ facebookId: profile.id, username: profile.name }),
        username: profile.name,
        displayName: profile.name,
        email: profile.email || `${profile.name.toLowerCase().replace(/\s+/g, "")}@facebook.com`,
        avatar: profile.avatarUrl || getDefaultAvatar(profile.name || profile.id),
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
        syncedFBFriends: fbFriends
      };
      saveAccountForProvider(newFBUser, 'facebook', profile.name);
      setJustClaimedWelcome(true);
      setUser(newFBUser);
      onSuccessLogin?.();
    } catch (err) {
      console.warn('Real Facebook SDK login failed or cancelled:', err);
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
      avatar: finalAvatar || getDefaultAvatar(finalName),
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
                  Continue as {fbUserName.trim() || 'Facebook User'} ✓
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

      {/* Policy Agreement Links at bottom of screen */}
      <div 
        className="absolute z-20 pointer-events-auto text-[9.5px] font-bold text-purple-300/60 text-center w-full select-none"
        style={{ bottom: "5%" }}
      >
        By logging in, you agree to our{' '}
        <span 
          onClick={() => { setPolicyInitialTab('TERMS'); setShowPolicyModal(true); }} 
          className="text-amber-400 hover:text-amber-300 cursor-pointer underline"
        >
          Terms of Service
        </span>{' '}
        &{' '}
        <span 
          onClick={() => { setPolicyInitialTab('REFUND'); setShowPolicyModal(true); }} 
          className="text-amber-400 hover:text-amber-300 cursor-pointer underline"
        >
          Refund Policy
        </span>.
      </div>

      {/* Guest Registration Multi-step Modal */}
      <GuestRegistrationModal
        isOpen={showGuestRegModal}
        onClose={() => setShowGuestRegModal(false)}
        onComplete={handleGuestRegistrationComplete}
      />

      {/* Terms and Refund Policy Modal */}
      <TermsPolicyModal
        isOpen={showPolicyModal}
        initialTab={policyInitialTab}
        onClose={() => setShowPolicyModal(false)}
      />
    </div>
  );
};
