import React from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { useSettingsStore } from '../store/settings.store';
import { useAdsStore } from '../store/ads.store';

interface AdsSettingsPageProps {
  onBack?: () => void;
}

export const AdsSettingsPage: React.FC<AdsSettingsPageProps> = ({ onBack }) => {
  const { personalizedAdsEnabled, gdprConsentGiven, setPersonalizedAds, updateConsent } = useSettingsStore();
  const { testModeEnabled, toggleTestMode } = useAdsStore();

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="settings" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            ADS SETTINGS
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Settings options list */}
        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6">
          <div className="bg-purple-950/60 border border-purple-800/40 rounded-3xl p-4 flex flex-col gap-4 shadow-md">
            <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">Privacy & Ads Personalization</span>

            {/* Switch 1 */}
            <div className="flex justify-between items-center bg-black/30 p-3 rounded-2xl border border-purple-900/30">
              <div className="flex flex-col flex-1 pr-3">
                <span className="text-xs font-black text-white">Personalized Advertisements</span>
                <span className="text-[9px] text-purple-300 italic mt-0.5">Allow ad networks to display targeted ads based on preferences.</span>
              </div>
              <input
                type="checkbox"
                checked={personalizedAdsEnabled}
                onChange={(e) => setPersonalizedAds(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Switch 2 */}
            <div className="flex justify-between items-center bg-black/30 p-3 rounded-2xl border border-purple-900/30">
              <div className="flex flex-col flex-1 pr-3">
                <span className="text-xs font-black text-white">GDPR & Privacy Consent</span>
                <span className="text-[9px] text-purple-300 italic mt-0.5">Toggle consent permissions for European economic region compliance laws.</span>
              </div>
              <input
                type="checkbox"
                checked={gdprConsentGiven}
                onChange={(e) => updateConsent(e.target.checked, true)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Switch 3 (Testing Mode) */}
            <div className="flex justify-between items-center bg-black/30 p-3 rounded-2xl border border-purple-900/30">
              <div className="flex flex-col flex-1 pr-3">
                <span className="text-xs font-black text-white">SDK Testing Mode</span>
                <span className="text-[9px] text-purple-300 italic mt-0.5">Show sandbox test ads instead of live production sponsors.</span>
              </div>
              <input
                type="checkbox"
                checked={testModeEnabled}
                onChange={toggleTestMode}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdsSettingsPage;
