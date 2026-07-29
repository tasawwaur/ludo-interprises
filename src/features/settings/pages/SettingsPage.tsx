import React, { useState, useEffect } from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import confetti from "canvas-confetti";

interface SettingsPageProps {
  onBack?: () => void;
  onLogout?: () => void;
}

type SettingsCategory = 
  | "GAME" 
  | "NOTIFY" 
  | "PRIVACY" 
  | "ACCESSIBILITY" 
  | "AUDIO" 
  | "PERFORMANCE" 
  | "NETWORK" 
  | "WALLET" 
  | "SECURITY" 
  | "SAFETY" 
  | "LEGAL" 
  | "DEVELOPER" 
  | "ABOUT" 
  | null;

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onLogout }) => {
  const logout = useUserStore((s) => s.logout);
  const user = useUserStore((s) => s.user);

  // States
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Custom Overlays
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<string | null>(null);

  // 1. Game Settings
  const [controlsStyle, setControlsStyle] = useState("Standard");
  const [graphicsQuality, setGraphicsQuality] = useState("High");
  const [fps60, setFps60] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState("Normal");
  const [diceAnimation, setDiceAnimation] = useState("3D Roll");
  const [vibration, setVibration] = useState(true);

  // 2. Expandable Notifications Toggles
  const [notifications, setNotifications] = useState(() => localStorage.getItem("set_notify") !== "false");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [friendOnline, setFriendOnline] = useState(true);
  const [friendOffline, setFriendOffline] = useState(false);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [tournamentReminder, setTournamentReminder] = useState(true);
  const [eventReminder, setEventReminder] = useState(true);
  const [maintenanceAlert, setMaintenanceAlert] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundNotifications, setSoundNotifications] = useState(true);

  // 3. Privacy Settings
  const [profileVisible, setProfileVisible] = useState("Public");
  const [whoCanMessage, setWhoCanMessage] = useState("Everyone");
  const [whoCanInvite, setWhoCanInvite] = useState("Everyone");
  const [hideProfile, setHideProfile] = useState(false);
  const [hideXP, setHideXP] = useState(false);
  const [hideRank, setHideRank] = useState(false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  const [showBlockList, setShowBlockList] = useState(false);
  const [showMuteList, setShowMuteList] = useState(false);

  // 4. Accessibility Settings
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState("Normal");

  // 5. Audio Sliders
  const [masterVolume, setMasterVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(60);
  const [effectsVolume, setEffectsVolume] = useState(75);
  const [voiceChat, setVoiceChat] = useState(true);
  
  // Microphone Testing simulation
  const [micTesting, setMicTesting] = useState(false);
  const [micLevels, setMicLevels] = useState<number[]>([10, 10, 10, 10, 10, 10, 10, 10]);

  // 6. Performance Settings
  const [fpsCounter, setFpsCounter] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);
  const [cacheSize, setCacheSize] = useState(24.8);
  const [clearingCache, setClearingCache] = useState(false);

  // 7. Language & Regional Settings
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("India");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat24, setTimeFormat24] = useState(false);

  // 8. Wallet
  const [promoCode, setPromoCode] = useState("");

  // 9. Security & Active Sessions
  const [twoFactor, setTwoFactor] = useState(false);
  const [passcodeLock, setPasscodeLock] = useState(false);
  const [fingerprintLogin, setFingerprintLogin] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [activeDevices, setActiveDevices] = useState([
    { id: 'dev_1', name: "OnePlus 11 (This Device)", status: "Active Now", icon: "📱" },
    { id: 'dev_2', name: "Windows PC (Vite Developer)", status: "Idle 10m ago", icon: "💻" }
  ]);
  const [trustedDevices, setTrustedDevices] = useState([
    { name: "iPhone 14 Pro", date: "Added June 2026", icon: "📱" }
  ]);

  // 10. Safety Center
  const [reportCategory, setReportCategory] = useState("Cheating");
  const [reportTarget, setReportTarget] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  // 11. Developer Tools
  const [debugMode, setDebugMode] = useState(false);
  const [fpsMonitor, setFpsMonitor] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // General overlays
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Microphone level simulator effect
  useEffect(() => {
    let interval: any;
    if (micTesting) {
      interval = setInterval(() => {
        setMicLevels(Array.from({ length: 8 }, () => Math.floor(Math.random() * 80) + 15));
      }, 150);
      // Auto stop after 5s
      setTimeout(() => {
        setMicTesting(false);
        setMicLevels([10, 10, 10, 10, 10, 10, 10, 10]);
        triggerToast("Microphone Test Complete!");
      }, 5000);
    } else {
      setMicLevels([10, 10, 10, 10, 10, 10, 10, 10]);
    }
    return () => clearInterval(interval);
  }, [micTesting]);

  // Toast Trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleCategory = (cat: SettingsCategory) => {
    setActiveCategory(activeCategory === cat ? null : cat);
  };

  // Cache cleaner simulation
  const handleClearCache = () => {
    if (clearingCache) return;
    setClearingCache(true);
    setTimeout(() => {
      setCacheSize(0);
      setClearingCache(false);
      triggerToast("Cache Cleared successfully!");
    }, 1500);
  };

  // Terminate other sessions
  const handleTerminateOtherSessions = () => {
    setActiveDevices(prev => prev.filter(d => d.id === 'dev_1'));
    triggerToast("Other Sessions Terminated Successfully!");
  };

  // Ping Test simulator
  const [pingResult, setPingResult] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);
  const runPingTest = () => {
    if (pinging) return;
    setPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setPinging(false);
      setPingResult(Math.floor(Math.random() * 45) + 12);
      triggerToast("Ping Test Complete!");
    }, 1200);
  };

  const handleRedeemPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === "LUDOGOLD") {
      confetti({ particleCount: 30, spread: 50, colors: ['#FFD700', '#FFA500'] });
      triggerToast("Promo Code Accepted! +500 Coins added.");
    } else {
      triggerToast("Invalid Promo Code!");
    }
    setPromoCode("");
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget.trim() || !reportDetails.trim()) {
      triggerToast("Please fill all details!");
      return;
    }
    triggerToast("Report Filed Successfully! Under investigation.");
    setReportTarget("");
    setReportDetails("");
  };

  const handleLogoutClick = () => {
    logout();
    onLogout?.();
  };

  // Mock FAQS data
  const faqs = [
    { id: 1, q: "How do I claim my Daily Quest rewards?", a: "Go to your Home Page, click on the Level/XP bar in the top-left to open Quest Details, and tap the golden 'Claim Rewards' button." },
    { id: 2, q: "Where can I play with my Facebook friends?", a: "Once logged in via Facebook, open the Friends page from the bottom navigation bar, find your online friends with the blue FB badge, and click 'Invite' to invite them to a private room!" },
    { id: 3, q: "How do I get free coins and gems?", a: "You can click on the Video Ads button on the left sidebar to watch ads, upgrade your VIP status in the VIP Shop, or spin the Lucky Spin wheel event!" }
  ];

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="settings" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text flex items-center gap-2">
            ⚙️ Settings Panel
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* ── SETTINGS ACCORDION CARDS LIST ── */}
        <div className="space-y-2 mb-6">
          
          {/* 1. GAME SETTINGS */}
          <AccordionCard
            title="🎮 Game Configuration"
            active={activeCategory === "GAME"}
            onClick={() => toggleCategory("GAME")}
          >
            <div className="space-y-3 pt-1">
              <SelectSelector
                title="Controls Style"
                options={["Standard", "One-Tap", "Drag-Drop"]}
                value={controlsStyle}
                onChange={setControlsStyle}
              />
              <SelectSelector
                title="Graphics"
                options={["Low", "Medium", "High", "Ultra"]}
                value={graphicsQuality}
                onChange={setGraphicsQuality}
              />
              <ToggleSwitch title="Ultra 60 FPS" value={fps60} onChange={setFps60} />
              <SelectSelector
                title="Animation Speed"
                options={["Slow", "Normal", "Fast"]}
                value={animationSpeed}
                onChange={setAnimationSpeed}
              />
              <SelectSelector
                title="Dice Roll Animation"
                options={["3D Roll", "Fast Snap", "No Animation"]}
                value={diceAnimation}
                onChange={setDiceAnimation}
              />
              <ToggleSwitch title="Vibration Feedback" value={vibration} onChange={setVibration} />
            </div>
          </AccordionCard>

          {/* 2. EXPANDED AUDIO SETTINGS */}
          <AccordionCard
            title="🔊 Audio & Voice"
            active={activeCategory === "AUDIO"}
            onClick={() => toggleCategory("AUDIO")}
          >
            <div className="space-y-3 pt-1">
              {/* Sliders */}
              <SliderInput title="Master Volume" value={masterVolume} onChange={setMasterVolume} />
              <SliderInput title="Music Volume" value={musicVolume} onChange={setMusicVolume} />
              <SliderInput title="Sound Effects" value={effectsVolume} onChange={setEffectsVolume} />
              
              <ToggleSwitch title="Voice Chat Channel" value={voiceChat} onChange={setVoiceChat} />
              
              {/* Mic Testing Simulation */}
              <div className="bg-black/40 p-3 rounded-2xl border border-purple-500/20 mt-2 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-purple-300 font-bold uppercase">Microphone Test</span>
                  <button
                    onClick={() => {
                      if (!micTesting) {
                        setMicTesting(true);
                      }
                    }}
                    disabled={micTesting}
                    className="px-3.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] rounded-lg active:scale-95 uppercase"
                  >
                    {micTesting ? "Testing..." : "Test Mic"}
                  </button>
                </div>
                
                {/* Simulated Decibel frequency bar display */}
                <div className="h-10 bg-black/60 rounded-xl flex items-center justify-center gap-1.5 px-3">
                  {micLevels.map((lvl, index) => (
                    <div
                      key={index}
                      className="w-2.5 rounded-full transition-all duration-150"
                      style={{
                        height: `${lvl}%`,
                        backgroundColor: lvl > 70 ? '#EF4444' : lvl > 45 ? '#F59E0B' : '#10B981'
                      }}
                    ></div>
                  ))}
                </div>
                <span className="text-[7.5px] text-gray-500 text-center uppercase tracking-wide">
                  {micTesting ? "Recording simulated voice frequency..." : "Click Test Mic to verify voice input"}
                </span>
              </div>
            </div>
          </AccordionCard>

          {/* 3. EXPANDED NOTIFICATIONS ACCORDION */}
          <AccordionCard
            title="🔔 Notification Alerts"
            active={activeCategory === "NOTIFY"}
            onClick={() => toggleCategory("NOTIFY")}
          >
            <div className="space-y-2 pt-1">
              <ToggleSwitch title="Master Notifications" value={notifications} onChange={setNotifications} />
              {notifications && (
                <div className="pl-3 border-l-2 border-amber-500/40 space-y-2 mt-2">
                  <SubToggleItem title="Push Notifications" value={pushNotifications} onChange={setPushNotifications} />
                  <SubToggleItem title="Friend Online Alert" value={friendOnline} onChange={setFriendOnline} />
                  <SubToggleItem title="Friend Offline Alert" value={friendOffline} onChange={setFriendOffline} />
                  <SubToggleItem title="Mention Notifications (@)" value={mentionNotifications} onChange={setMentionNotifications} />
                  <SubToggleItem title="Tournament Reminders" value={tournamentReminder} onChange={setTournamentReminder} />
                  <SubToggleItem title="Event Reminders" value={eventReminder} onChange={setEventReminder} />
                  <SubToggleItem title="Maintenance Alerts" value={maintenanceAlert} onChange={setMaintenanceAlert} />
                  <SubToggleItem title="Email Alerts" value={emailNotifications} onChange={setEmailNotifications} />
                  <SubToggleItem title="Sound Notifications" value={soundNotifications} onChange={setSoundNotifications} />
                </div>
              )}
            </div>
          </AccordionCard>

          {/* 4. EXPANDED PRIVACY & VISIBILITY */}
          <AccordionCard
            title="🔐 Privacy Settings"
            active={activeCategory === "PRIVACY"}
            onClick={() => toggleCategory("PRIVACY")}
          >
            <div className="space-y-3 pt-1">
              <SelectSelector
                title="Who can message me"
                options={["Everyone", "Friends", "No One"]}
                value={whoCanMessage}
                onChange={setWhoCanMessage}
              />
              <SelectSelector
                title="Who can invite me"
                options={["Everyone", "Friends", "No One"]}
                value={whoCanInvite}
                onChange={setWhoCanInvite}
              />
              <ToggleSwitch title="Hide Profile details" value={hideProfile} onChange={setHideProfile} />
              <ToggleSwitch title="Hide Level XP bar" value={hideXP} onChange={setHideXP} />
              <ToggleSwitch title="Hide League Rank" value={hideRank} onChange={setHideRank} />
              <ToggleSwitch title="Hide Online Status" value={hideOnlineStatus} onChange={setHideOnlineStatus} />

              <div className="grid grid-cols-2 gap-2 text-center mt-2">
                <button
                  onClick={() => setShowBlockList(true)}
                  className="py-2.5 bg-black/40 border border-purple-500/15 text-[10px] font-black text-purple-200 rounded-xl hover:border-purple-400 active:scale-95"
                >
                  Block List (2)
                </button>
                <button
                  onClick={() => setShowMuteList(true)}
                  className="py-2.5 bg-black/40 border border-purple-500/15 text-[10px] font-black text-purple-200 rounded-xl hover:border-purple-400 active:scale-95"
                >
                  Muted Players (0)
                </button>
              </div>
            </div>
          </AccordionCard>

          {/* 5. ACCESSIBILITY SETTINGS */}
          <AccordionCard
            title="♿ Accessibility"
            active={activeCategory === "ACCESSIBILITY"}
            onClick={() => toggleCategory("ACCESSIBILITY")}
          >
            <div className="space-y-3 pt-1">
              <ToggleSwitch title="High Contrast Mode" value={highContrast} onChange={setHighContrast} />
              <ToggleSwitch title="Reduce Motion (UI)" value={reduceMotion} onChange={setReduceMotion} />
              <ToggleSwitch title="Large Interface Text" value={largeText} onChange={setLargeText} />
              <ToggleSwitch title="Screen Reader Support" value={screenReader} onChange={setScreenReader} />
              <SelectSelector
                title="Color Blind Filter"
                options={["Normal", "Protanopia", "Deuteranopia", "Tritanopia"]}
                value={colorBlindMode}
                onChange={setColorBlindMode}
              />
            </div>
          </AccordionCard>

          {/* 6. PERFORMANCE & PERFORMANCE MONITOR */}
          <AccordionCard
            title="⚡ Performance & Storage"
            active={activeCategory === "PERFORMANCE"}
            onClick={() => toggleCategory("PERFORMANCE")}
          >
            <div className="space-y-3 pt-1">
              <ToggleSwitch title="FPS Counter overlay" value={fpsCounter} onChange={setFpsCounter} />
              <ToggleSwitch title="Battery Saver Mode" value={batterySaver} onChange={setBatterySaver} />
              
              <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-2xl border border-purple-500/20">
                <div className="flex flex-col">
                  <span className="text-[10px] text-purple-300 font-black uppercase">App Cache</span>
                  <span className="text-xs font-black text-white">{cacheSize.toFixed(1)} MB</span>
                </div>
                <button
                  onClick={handleClearCache}
                  disabled={clearingCache || cacheSize === 0}
                  className="px-3.5 py-1.5 bg-purple-800 text-white font-black text-[10px] rounded-xl border border-purple-500 hover:bg-purple-700 active:scale-95"
                >
                  {clearingCache ? "Clearing..." : "Cache Cleaner"}
                </button>
              </div>

              <div className="bg-black/30 p-2.5 rounded-xl border border-purple-500/10 text-[10px] space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Storage Usage:</span>
                  <span className="text-white font-bold">124.5 MB</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Downloaded Assets:</span>
                  <span className="text-emerald-400 font-bold">Up-to-date (v1.0)</span>
                </div>
              </div>
            </div>
          </AccordionCard>

          {/* 7. LANGUAGE FORMATS */}
          <AccordionCard
            title="🌐 Language & Formats"
            active={activeCategory === "NETWORK"}
            onClick={() => toggleCategory("NETWORK")}
          >
            <div className="space-y-3 pt-1">
              <SelectSelector
                title="App Language"
                options={["English", "Hindi", "Spanish", "Arabic"]}
                value={language}
                onChange={setLanguage}
              />
              <SelectSelector
                title="Country Location"
                options={["India", "Nepal", "UAE", "USA"]}
                value={country}
                onChange={setCountry}
              />
              <SelectSelector
                title="Date Format"
                options={["DD/MM/YYYY", "MM/DD/YYYY"]}
                value={dateFormat}
                onChange={setDateFormat}
              />
              <ToggleSwitch title="Use 24-Hour Time Format" value={timeFormat24} onChange={setTimeFormat24} />
            </div>
          </AccordionCard>

          {/* 8. SECURITY & SESSION MANAGER */}
          <AccordionCard
            title="🛡️ Security & Sessions"
            active={activeCategory === "SECURITY"}
            onClick={() => toggleCategory("SECURITY")}
          >
            <div className="space-y-3 pt-1">
              <ToggleSwitch title="Two-Factor Authentication" value={twoFactor} onChange={setTwoFactor} />
              <ToggleSwitch title="Screen Passcode Lock" value={passcodeLock} onChange={setPasscodeLock} />
              <ToggleSwitch title="Biometric / Face Login" value={fingerprintLogin} onChange={setFingerprintLogin} />

              <div className="pt-2 border-t border-purple-500/20">
                <span className="text-[10px] font-black text-amber-300 block mb-1.5 uppercase">Session Manager</span>
                <div className="space-y-2">
                  {activeDevices.map(d => (
                    <div key={d.id} className="flex justify-between items-center text-[10px] bg-black/40 px-3 py-2 rounded-xl border border-purple-500/10">
                      <div className="flex items-center gap-1.5">
                        <span>{d.icon}</span>
                        <div>
                          <span className="font-bold text-white block">{d.name}</span>
                          <span className="text-[8px] text-purple-300">{d.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeDevices.length > 1 && (
                    <button
                      onClick={handleTerminateOtherSessions}
                      className="w-full py-1.5 bg-red-950 border border-red-500/20 text-red-300 font-bold text-[9px] rounded-lg"
                    >
                      Terminate Other Active Sessions
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-purple-500/20 text-[10px]">
                <span className="font-black text-amber-300 block mb-1 uppercase">Trusted Devices</span>
                {trustedDevices.map((t, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300 bg-black/40 p-2 rounded-lg">
                    <span>{t.icon} {t.name}</span>
                    <span className="text-purple-300">{t.date}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center mt-2 text-[9px] font-bold">
                <button onClick={() => setShowLoginHistory(true)} className="py-2.5 bg-purple-900/40 border border-purple-500/15 rounded-xl hover:border-purple-400">
                  Login History Log
                </button>
                <button onClick={() => triggerToast("Cloud Sync Complete!")} className="py-2.5 bg-purple-900/40 border border-purple-500/15 rounded-xl hover:border-purple-400">
                  Backup & Restore Account
                </button>
              </div>
            </div>
          </AccordionCard>

          {/* 9. WALLET */}
          <AccordionCard
            title="💎 Wallet & Promo Codes"
            active={activeCategory === "WALLET"}
            onClick={() => toggleCategory("WALLET")}
          >
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-black/40 p-2 rounded-xl border border-purple-500/20">
                  <span className="text-[9px] text-amber-400 block font-black">COINS</span>
                  <span className="font-mono font-black">{user?.coins || 10000}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-xl border border-purple-500/20">
                  <span className="text-[9px] text-blue-400 block font-black">GEMS</span>
                  <span className="font-mono font-black">{user?.gems || 100}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (LUDOGOLD)..."
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-black/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/30 text-xs focus:outline-none focus:border-amber-400 uppercase"
                />
                <button
                  onClick={handleRedeemPromo}
                  className="px-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-xl"
                >
                  Redeem
                </button>
              </div>
            </div>
          </AccordionCard>

          {/* 10. SAFETY CENTER */}
          <AccordionCard
            title="🚫 Safety & Reports"
            active={activeCategory === "SAFETY"}
            onClick={() => toggleCategory("SAFETY")}
          >
            <form onSubmit={handleSendReport} className="space-y-2.5 pt-1">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[8px] font-black text-amber-400 uppercase block mb-0.5">Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/60 border border-purple-500/30 rounded-xl text-white text-[11px] focus:outline-none"
                  >
                    <option value="Cheating">Cheating</option>
                    <option value="Bug">Bug Report</option>
                    <option value="Harassment">Abuse / Harassment</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[8px] font-black text-amber-400 uppercase block mb-0.5">Target Player/Module</label>
                  <input
                    type="text"
                    value={reportTarget}
                    onChange={(e) => setReportTarget(e.target.value)}
                    placeholder="ID or Screen name..."
                    className="w-full px-2 py-1.5 bg-black/60 border border-purple-500/30 rounded-xl text-white text-[11px] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[8px] font-black text-amber-400 uppercase block mb-0.5">Details</label>
                <textarea
                  rows={2}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Tell us what happened..."
                  className="w-full px-2 py-1.5 bg-black/60 border border-purple-500/30 rounded-xl text-white text-[11px] focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-xl"
              >
                Submit Safety Report
              </button>
            </form>
          </AccordionCard>

          {/* 11. HELP & SUPPORT BUTTON */}
          <div
            onClick={() => setShowHelpModal(true)}
            className="bg-purple-950/80 border-2 border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:scale-[1.01] hover:border-purple-400 active:scale-95 transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🆘</span>
              <span className="text-xs font-black text-white">Help & Support Center</span>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </div>

          {/* 12. DEVELOPER TOOLS */}
          <AccordionCard
            title="🛠️ Developer Options"
            active={activeCategory === "DEVELOPER"}
            onClick={() => toggleCategory("DEVELOPER")}
          >
            <div className="space-y-3 pt-1">
              <ToggleSwitch title="Debug Output Console" value={debugMode} onChange={setDebugMode} />
              <ToggleSwitch title="FPS Live Monitor overlay" value={fpsMonitor} onChange={setFpsMonitor} />
              
              {/* Logs reader terminal */}
              <div className="bg-black/30 p-2.5 rounded-2xl border border-purple-500/10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogs(!showLogs)}
                  className="w-full text-left text-[9px] font-black text-amber-300 uppercase tracking-widest flex justify-between"
                >
                  <span>System Console Log</span>
                  <span>{showLogs ? "▲ Hide" : "▼ Show"}</span>
                </button>
                {showLogs && (
                  <div className="bg-black text-emerald-400 font-mono text-[9px] p-2.5 rounded-xl max-h-[110px] overflow-y-auto w-full border border-emerald-900/60 leading-normal">
                    <p>[SYS] Ludo Enterprise boot sequence: OK</p>
                    <p>[NET] Active route: India gateway (ping optimal)</p>
                    <p>[GUI] Pre-cached luxury assets in memory</p>
                    <p>[AUTH] Local profile token validation: SUCCESS</p>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-gray-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="text-white font-mono">v2.4.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Build Number:</span>
                  <span className="text-white font-mono">Build 1082-A</span>
                </div>
              </div>
            </div>
          </AccordionCard>

          {/* 13. LEGAL DOCUMENTS */}
          <AccordionCard
            title="📄 Legal Documents"
            active={activeCategory === "LEGAL"}
            onClick={() => toggleCategory("LEGAL")}
          >
            <div className="grid grid-cols-2 gap-2 text-left pt-1">
              <LegalLink title="Terms & Conditions" onClick={() => setActiveLegalDoc("TERMS")} />
              <LegalLink title="Privacy Policy" onClick={() => setActiveLegalDoc("PRIVACY")} />
              <LegalLink title="Community Guidelines" onClick={() => setActiveLegalDoc("COMMUNITY")} />
              <LegalLink title="Fair Play Rules" onClick={() => setActiveLegalDoc("FAIRPLAY")} />
              <LegalLink title="Anti-Cheat Policy" onClick={() => setActiveLegalDoc("ANTICHEAT")} />
              <LegalLink title="User Conduct Policy" onClick={() => setActiveLegalDoc("CONDUCT")} />
              <LegalLink title="Content Policy" onClick={() => setActiveLegalDoc("CONTENT")} />
              <LegalLink title="Responsible Gaming" onClick={() => setActiveLegalDoc("RESPONSIBLE")} />
              <LegalLink title="Refund & Cancellation" onClick={() => setActiveLegalDoc("REFUND")} />
              <LegalLink title="Cookie Policy" onClick={() => setActiveLegalDoc("COOKIE")} />
              <LegalLink title="Data Retention Policy" onClick={() => setActiveLegalDoc("RETENTION")} />
              <LegalLink title="Child Safety Policy" onClick={() => setActiveLegalDoc("CHILD_SAFETY")} />
              <LegalLink title="Licenses & Open Source" onClick={() => setActiveLegalDoc("LICENSES")} />
            </div>
          </AccordionCard>

          {/* 14. ABOUT */}
          <AccordionCard
            title="ℹ️ About Studio"
            active={activeCategory === "ABOUT"}
            onClick={() => toggleCategory("ABOUT")}
          >
            <div className="space-y-2 pt-1 text-[11px] text-gray-300">
              <div className="flex justify-between">
                <span>Developer Studio:</span>
                <span>Ludo Enterprise Studio Inc.</span>
              </div>
              <div className="flex justify-between">
                <span>Official Web Domain:</span>
                <span className="text-amber-400">ludostar.com</span>
              </div>
              <div className="pt-2 border-t border-purple-500/10 grid grid-cols-4 gap-2 text-center text-lg">
                <a href="https://discord.gg" target="_blank" rel="noreferrer" title="Discord">💬</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook">📘</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram">📸</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" title="YouTube">🔴</a>
              </div>
            </div>
          </AccordionCard>
        </div>

        {/* 🚪 ACCOUNT ACTIONS (Logout, Delete, Reset) */}
        <div className="space-y-2.5 mt-auto">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={resetAllSettings}
              className="py-2.5 bg-black/40 border border-purple-500/20 text-[10px] font-black text-purple-300 rounded-xl hover:bg-black/60 active:scale-95 transition-all"
            >
              Reset Settings
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="py-2.5 bg-black/40 border border-red-500/20 text-[10px] font-black text-red-400 rounded-xl hover:bg-red-950/20 active:scale-95 transition-all"
            >
              Delete Account
            </button>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl text-white font-black text-xs tracking-widest uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all border border-red-400 mb-2"
          >
            Logout Account
          </button>
        </div>
      </div>

      {/* ── HELP & SUPPORT OVERLAY SHEET ── */}
      {showHelpModal && (
        <div className="absolute inset-0 bg-[#12061F] z-50 flex flex-col transition-all animate-in fade-in duration-200">
          <LudoPageBackground variant="settings" />
          <div className="w-full h-full flex flex-col relative z-10 px-4 py-4 overflow-y-auto no-scrollbar pb-6">
            <div className="flex items-center justify-between mb-5 pb-2 border-b border-purple-500/20">
              <h2 className="text-base font-black tracking-widest text-white uppercase glow-amber-text flex items-center gap-2">
                <span>🆘</span> HELP & SUPPORT
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center font-black text-xs hover:bg-black/60 active:scale-90"
              >
                ✕
              </button>
            </div>

            {/* FAQ List */}
            <div className="bg-gradient-to-b from-[#2E0B4E]/85 to-[#1F0736]/85 border-2 border-purple-500/40 rounded-3xl p-4 shadow-xl mb-4 relative">
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider mb-3">📚 FAQs</h3>
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border-b border-purple-500/10 pb-2">
                    <button
                      onClick={() => setActiveFaqId(activeFaqId === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between text-left py-1 text-xs font-bold text-gray-200"
                    >
                      <span>{faq.q}</span>
                      <span className="text-[10px] text-amber-400 ml-2">{activeFaqId === faq.id ? "▲" : "▼"}</span>
                    </button>
                    {activeFaqId === faq.id && (
                      <p className="text-[10px] text-purple-200/80 leading-relaxed mt-1 bg-black/30 p-2.5 rounded-xl border border-purple-500/15">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact support rows */}
            <div className="bg-gradient-to-b from-[#2E0B4E]/85 to-[#1F0736]/85 border-2 border-purple-500/40 rounded-3xl p-4 shadow-xl mb-4">
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider mb-3">✉️ Contact Support</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowLiveChat(true)}
                  className="w-full bg-black/40 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <div>
                      <span className="text-xs font-black text-white block">Live Support Chat</span>
                      <span className="text-[9px] text-emerald-400 font-extrabold">Agent Online</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">CONNECT ❯</span>
                </button>

                <a
                  href="mailto:support@ludostar.com"
                  className="w-full bg-black/40 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📧</span>
                    <div>
                      <span className="text-xs font-black text-white block">Email Support</span>
                      <span className="text-[9px] text-gray-400">Response within 24h</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">EMAIL ❯</span>
                </a>

                <button
                  onClick={() => setShowSubmitTicket(true)}
                  className="w-full bg-black/40 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎫</span>
                    <div>
                      <span className="text-xs font-black text-white block">Submit a Ticket</span>
                      <span className="text-[9px] text-gray-400">Payment/Account help</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">OPEN ❯</span>
                </button>
              </div>
            </div>

            {/* Guide & Feedback */}
            <div className="bg-gradient-to-b from-[#2E0B4E]/85 to-[#1F0736]/85 border-2 border-purple-500/40 rounded-3xl p-4 shadow-xl">
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider mb-3">📖 Guides</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowTutorials(true)}
                  className="w-full bg-black/40 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎓</span>
                    <div>
                      <span className="text-xs font-black text-white block">Tutorials & Rules</span>
                      <span className="text-[9px] text-gray-400">How to play</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">VIEW ❯</span>
                </button>

                <button
                  onClick={() => setShowFeedback(true)}
                  className="w-full bg-black/40 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">✍️</span>
                    <div>
                      <span className="text-xs font-black text-white block">Provide Feedback</span>
                      <span className="text-[9px] text-gray-400">Help us improve</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">SUBMIT ❯</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SEPARATE LEGAL PAGE READERS ("alag pages") ── */}
      {activeLegalDoc && (
        <div className="absolute inset-0 bg-[#0C0315] z-[120] flex flex-col transition-all animate-in slide-in-from-bottom duration-250">
          <LudoPageBackground variant="settings" />
          <div className="w-full h-full flex flex-col relative z-10 px-5 py-6 overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-amber-400/25">
              <h2 className="text-sm font-black text-amber-300 tracking-wider uppercase">
                📜 {activeLegalDoc.replace("&", "and")} Document
              </h2>
              <button
                onClick={() => setActiveLegalDoc(null)}
                className="px-3.5 py-1.5 bg-purple-800 border border-purple-500 text-white font-black text-[10px] rounded-xl hover:bg-purple-700 active:scale-95"
              >
                BACK
              </button>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1 text-xs text-purple-200 leading-relaxed font-mono bg-black/40 p-4 rounded-3xl border border-purple-500/10">
              <h3 className="text-sm font-black text-white border-b border-purple-500/20 pb-1">SECTION I: Guidelines Overview</h3>
              <p>Welcome to the official legal documents of Ludo Enterprise. Tapping Accept & Close confirms compliance with all active system guidelines and security policies.</p>
              
              <h3 className="text-sm font-black text-white border-b border-purple-500/20 pb-1">SECTION II: User Data Privacy</h3>
              <p>We process connection tokens, account profile fields, and game event histories solely to coordinate matchmaking queues, rooms, and verify active sessions.</p>

              <h3 className="text-sm font-black text-white border-b border-purple-500/20 pb-1">SECTION III: Fair Play Regulations</h3>
              <p>Any use of automated scripts, modifications to the game state parameters, or cheater client clients will result in temporary or permanent profile banning.</p>
              
              <p className="text-[10px] text-gray-500 mt-6 pt-4 border-t border-purple-500/20">Last updated: July 2026. Ludo Enterprise Studio Inc.</p>
            </div>

            <button
              onClick={() => setActiveLegalDoc(null)}
              className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-xs tracking-widest uppercase rounded-2xl active:scale-95"
            >
              Accept & Close
            </button>
          </div>
        </div>
      )}

      {/* ── MOCK LOGIN HISTORY POPUP ── */}
      {showLoginHistory && (
        <div className="absolute inset-0 z-[130] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative">
            <button onClick={() => setShowLoginHistory(false)} className="absolute top-3 right-4 text-amber-300 font-bold text-xs">✕</button>
            <h3 className="text-sm font-black text-amber-300 text-center uppercase">Login History Log</h3>
            <div className="space-y-2 text-[10px] max-h-[220px] overflow-y-auto no-scrollbar font-mono pr-1">
              <div className="bg-black/40 p-2.5 rounded-xl border border-purple-500/10">
                <span className="text-emerald-400 block font-bold">29-Jul-2026 18:25</span>
                <span className="text-gray-300">Mumbai Gateway IP: 103.58.20.19</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-purple-500/10">
                <span className="text-gray-400 block font-bold">28-Jul-2026 14:10</span>
                <span className="text-gray-300">Mumbai Gateway IP: 103.58.20.19</span>
              </div>
            </div>
            <button onClick={() => setShowLoginHistory(false)} className="w-full py-2 bg-purple-800 text-white font-black text-xs rounded-xl">Close Log</button>
          </div>
        </div>
      )}

      {/* ── MOCK BLOCK LIST POPUP ── */}
      {showBlockList && (
        <div className="absolute inset-0 z-[130] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative">
            <button onClick={() => setShowBlockList(false)} className="absolute top-3 right-4 text-amber-300 font-bold text-xs">✕</button>
            <h3 className="text-sm font-black text-amber-300 text-center uppercase">Block List</h3>
            <div className="space-y-2 text-[10.5px]">
              <div className="bg-black/40 p-2.5 rounded-xl border border-purple-500/10 flex justify-between items-center">
                <span>👤 CheaterPlayer99</span>
                <button onClick={() => triggerToast("Player unblocked")} className="text-[9px] text-amber-400 uppercase font-black">Unblock</button>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-purple-500/10 flex justify-between items-center">
                <span>👤 SpammerBoy</span>
                <button onClick={() => triggerToast("Player unblocked")} className="text-[9px] text-amber-400 uppercase font-black">Unblock</button>
              </div>
            </div>
            <button onClick={() => setShowBlockList(false)} className="w-full py-2 bg-purple-800 text-white font-black text-xs rounded-xl">Close</button>
          </div>
        </div>
      )}

      {/* ── MOCK MUTE LIST POPUP ── */}
      {showMuteList && (
        <div className="absolute inset-0 z-[130] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative text-center">
            <button onClick={() => setShowMuteList(false)} className="absolute top-3 right-4 text-amber-300 font-bold text-xs">✕</button>
            <h3 className="text-sm font-black text-amber-300 uppercase">Muted Players</h3>
            <p className="text-[11px] text-purple-300 my-4">No muted players in your list.</p>
            <button onClick={() => setShowMuteList(false)} className="w-full py-2 bg-purple-800 text-white font-black text-xs rounded-xl">Close</button>
          </div>
        </div>
      )}

      {/* ── CHAT MODAL SIMULATOR ── */}
      {showLiveChat && (
        <div className="absolute inset-0 z-[130] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-[350px] h-[480px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl overflow-hidden flex flex-col">
            <div className="bg-[#1C0D2E] p-3 border-b border-purple-500/20 flex justify-between">
              <span className="text-xs font-black text-white">Live Help Chat</span>
              <button onClick={() => setShowLiveChat(false)} className="text-amber-300 font-bold text-xs">✕</button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-2 bg-[#0C0315] text-[11px]">
              {chatLog.map((log, i) => (
                <div key={i} className={`flex flex-col ${log.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-2.5 rounded-2xl ${log.sender === 'user' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-purple-900/80 text-white'}`}>
                    {log.text}
                  </div>
                  <span className="text-[7px] text-gray-500 mt-0.5">{log.time}</span>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-purple-500/20 bg-[#1C0D2E] flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type help query..."
                className="flex-1 px-3 py-2 bg-black/60 border border-purple-500/30 rounded-xl text-white text-xs focus:outline-none"
              />
              <button onClick={handleSendChatMessage} className="px-4 bg-amber-400 text-slate-950 font-black text-xs rounded-xl">Send</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TICKET SUBMIT FORM ── */}
      {showSubmitTicket && (
        <div className="absolute inset-0 z-[130] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleTicketSubmit} className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative">
            <button type="button" onClick={() => setShowSubmitTicket(false)} className="absolute top-3 right-4 text-amber-300 text-lg">✕</button>
            <h3 className="text-sm font-black text-amber-300 text-center uppercase">Submit Support Ticket</h3>
            <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)} className="w-full px-3 py-2 bg-black/60 border border-purple-500/30 rounded-xl text-white text-xs">
              <option value="Payment Issue">Payment Issue</option>
              <option value="Matchmaking Error">Matchmaking Error</option>
              <option value="Account Recovery">Account Recovery</option>
            </select>
            <textarea rows={3} value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} placeholder="Describe problem..." className="w-full px-3 py-2 bg-black/60 border border-purple-500/30 rounded-xl text-white text-xs" />
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-xs uppercase rounded-xl">Submit Ticket</button>
          </form>
        </div>
      )}

      {/* ── FEEDBACK FORM ── */}
      {showFeedback && (
        <div className="absolute inset-0 z-[130] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative">
            <button onClick={() => setShowFeedback(false)} className="absolute top-3 right-4 text-amber-300">✕</button>
            <h3 className="text-sm font-black text-amber-300 text-center uppercase">Send Game Feedback</h3>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setFeedbackRating(s)} className="text-xl">{s <= feedbackRating ? "★" : "☆"}</button>
              ))}
            </div>
            <textarea rows={2} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Feature suggestions..." className="w-full px-3 py-2 bg-black/60 border border-purple-500/30 rounded-xl text-white text-xs" />
            <button onClick={handleFeedbackSubmit} className="w-full py-2.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-xs uppercase rounded-xl">Send Review</button>
          </div>
        </div>
      )}

      {/* ── TUTORIALS HANDBOOK ── */}
      {showTutorials && (
        <div className="absolute inset-0 z-[130] bg-black/95 flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] h-[400px] bg-gradient-to-b from-[#2E0B4E] to-[#12061F] border-2 border-amber-400 rounded-3xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-black text-amber-300 text-center uppercase">Ludo Tutorials</h3>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 text-[10px] text-gray-300">
              <p className="font-bold text-white">1. ROLL A 6:</p>
              <p>Release a token from starting yard.</p>
              <p className="font-bold text-white">2. BOOT OPPONENTS:</p>
              <p>Capture opponent pieces by landing on their spot to steal turns.</p>
              <p className="font-bold text-white">3. GET HOME:</p>
              <p>Bring 4 tokens to center zone to claim victory!</p>
            </div>
            <button onClick={() => setShowTutorials(false)} className="w-full py-2.5 bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl">Close</button>
          </div>
        </div>
      )}

      {/* ── DELETE ACCOUNT CONFIRM MODAL ── */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[130] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-red-950 via-[#1A052A] to-[#0D0216] border-2 border-red-500 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 relative text-center">
            <span className="text-4xl">⚠</span>
            <h3 className="text-base font-black text-red-500 uppercase">Delete Account?</h3>
            <p className="text-[11px] text-purple-200 leading-relaxed">
              This action is permanent! You will lose all accumulated coins, diamonds, and VIP ratings. Are you absolutely sure?
            </p>
            <div className="w-full flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-purple-900/60 border border-purple-500/20 text-white font-black text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl border border-red-400 shadow-lg active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING TOAST BAR ── */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[200] px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-900 border-2 border-amber-400 rounded-xl shadow-lg animate-bounce">
          <span className="text-[9px] font-black text-amber-300 tracking-wider uppercase select-none">
            ✨ {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
};

const AccordionCard = ({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-purple-950/80 border-2 border-purple-500/30 rounded-3xl shadow-md overflow-hidden transition-all duration-200">
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center justify-between text-left select-none outline-none focus:outline-none"
    >
      <span className="text-xs font-black text-white">{title}</span>
      <span className="text-xs text-amber-400">{active ? "▼" : "❯"}</span>
    </button>
    {active && (
      <div className="px-4 pb-4 border-t border-purple-500/10 bg-black/10 flex flex-col gap-2.5">
        {children}
      </div>
    )}
  </div>
);

const ToggleSwitch = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-xs font-bold text-gray-200">{title}</span>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-11 h-5.5 rounded-full p-[2px] transition-colors relative flex items-center shadow-inner ${
        value ? "bg-emerald-500" : "bg-gray-700"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      ></div>
    </button>
  </div>
);

const SubToggleItem = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-0.5">
    <span className="text-[10px] text-gray-300">{title}</span>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-9 h-4.5 rounded-full p-[2px] transition-colors relative flex items-center shadow-inner ${
        value ? "bg-emerald-500" : "bg-gray-700"
      }`}
    >
      <div
        className={`w-3 h-3 rounded-full bg-white shadow transform transition-transform ${
          value ? "translate-x-4" : "translate-x-0"
        }`}
      ></div>
    </button>
  </div>
);

const SelectSelector = ({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="flex flex-col gap-1 py-1">
    <span className="text-[10px] text-purple-300 font-bold uppercase">{title}</span>
    <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-purple-500/20">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`py-1 text-[9px] font-black rounded-lg transition-all ${
            value === opt
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const ToggleItem = ({
  icon,
  title,
  value,
  onChange,
}: {
  icon: string;
  title: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) => (
  <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-purple-500/15">
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <span className="text-xs font-bold text-white">{title}</span>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-10 h-5.5 rounded-full p-[2px] transition-colors relative flex items-center shadow-inner ${
        value ? "bg-emerald-500" : "bg-gray-700"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
          value ? "translate-x-4.5" : "translate-x-0"
        }`}
      ></div>
    </button>
  </div>
);

const SliderInput = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number;
  onChange: (val: number) => void;
}) => (
  <div className="flex flex-col gap-1.5 py-1">
    <div className="flex justify-between text-[10px] text-purple-300 font-bold uppercase">
      <span>{title}</span>
      <span className="text-amber-400 font-mono">{value}%</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
    />
  </div>
);

const LegalLink = ({ title, onClick }: { title: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-black/40 border border-purple-500/15 rounded-xl p-2.5 text-[9px] font-black text-purple-200 hover:border-amber-400 active:scale-95 transition-all text-left"
  >
    {title} ❯
  </button>
);
