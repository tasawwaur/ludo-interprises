import React from 'react';
import useInterstitialAd from '../hooks/useInterstitialAd';

export const InterstitialWidget: React.FC = () => {
  const { showInterstitial, isPlaying } = useInterstitialAd('ad_interstitial_1');

  const handleTestShow = async () => {
    await showInterstitial();
  };

  return (
    <div className="bg-purple-950/40 border border-purple-900/30 rounded-2xl p-3 flex justify-between items-center">
      <div className="flex flex-col">
        <span className="text-[10px] text-white font-black">Interstitial Simulation</span>
        <span className="text-[8px] text-purple-300 mt-0.5">Test standard interstitial ad displays</span>
      </div>
      
      <button
        onClick={handleTestShow}
        className="px-3.5 py-1.5 bg-purple-900 border border-purple-800 text-[8px] font-black uppercase rounded-lg active:scale-95 transition-all"
      >
        TEST SHOW
      </button>
    </div>
  );
};
export default InterstitialWidget;
