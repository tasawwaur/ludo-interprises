import React from 'react';
import useRewardedAd from '../../hooks/useRewardedAd';

interface RewardedAdProps {
  adId: string;
  rewardId: string;
  label: string;
  onSuccess?: () => void;
}

export const RewardedAd: React.FC<RewardedAdProps> = ({ adId, rewardId, label, onSuccess }) => {
  const { isLoaded, isPlaying, showRewarded } = useRewardedAd(adId);

  const handlePlay = async () => {
    if (!isLoaded || isPlaying) return;
    const success = await showRewarded(rewardId);
    if (success) {
      onSuccess?.();
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={!isLoaded || isPlaying}
      className={`w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-purple-950 font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl transition-all border border-yellow-200 ${
        isPlaying ? 'animate-pulse' : 'hover:scale-[1.02] active:scale-95'
      }`}
    >
      {isPlaying ? 'PLAYING VIDEO AD...' : label}
    </button>
  );
};
export default RewardedAd;
