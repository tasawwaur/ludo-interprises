import React, { useEffect } from 'react';
import useBannerAd from '../../hooks/useBannerAd';
import LoadingAd from '../LoadingAd';

interface BannerAdProps {
  placementId: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({ placementId }) => {
  const { isLoaded, loadBanner, destroyBanner } = useBannerAd(placementId);

  useEffect(() => {
    loadBanner();
    return () => {
      destroyBanner();
    };
  }, [placementId]);

  return (
    <div className="w-full bg-[#110720] border-t border-purple-950 p-2 flex items-center justify-center min-h-[50px] shadow-2xl relative">
      {!isLoaded ? (
        <LoadingAd />
      ) : (
        <div className="w-full max-w-[320px] h-[50px] bg-slate-800/80 border border-purple-900/40 rounded flex items-center justify-center text-[10px] text-purple-300 font-bold tracking-widest relative">
          <span className="absolute top-0.5 left-1 text-[7px] text-gray-500 bg-black/40 px-1 rounded uppercase">AD</span>
          ADMOB SPONSOR BANNER
        </div>
      )}
    </div>
  );
};
export default BannerAd;
