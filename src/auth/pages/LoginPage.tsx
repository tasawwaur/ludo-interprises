import React, { useState } from "react";
import { useUserStore } from "../../user/user.store";

interface LoginPageProps {
  onSuccessLogin?: () => void;
  onToggleRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const setUser = useUserStore((s) => s.setUser);

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
    });
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
        onClick={() => handlePerformLogin("Google")}
        className="absolute z-20 w-[80%] max-w-[340px] h-[52px] rounded-full pointer-events-auto cursor-pointer border-0 outline-none ring-0 bg-transparent active:scale-[0.96] transition-transform duration-75"
        style={{ bottom: "28.2%", left: "50%", transform: "translateX(-50%)", WebkitTapHighlightColor: "transparent" }}
        title="Login With Google"
      ></button>

      {/* B. FACEBOOK LOGIN BUTTON (Middle Button on Image) */}
      <button
        onClick={() => handlePerformLogin("Facebook")}
        className="absolute z-20 w-[80%] max-w-[340px] h-[52px] rounded-full pointer-events-auto cursor-pointer border-0 outline-none ring-0 bg-transparent active:scale-[0.96] transition-transform duration-75"
        style={{ bottom: "19.4%", left: "50%", transform: "translateX(-50%)", WebkitTapHighlightColor: "transparent" }}
        title="Login With Facebook"
      ></button>

      {/* C. PLAY AS GUEST BUTTON (Bottom Button on Image) */}
      <button
        onClick={() => handlePerformLogin("Guest", "Guest Malik")}
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
    </div>
  );
};
