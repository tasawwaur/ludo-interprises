import React from 'react';
import useNativeAd from '../../hooks/useNativeAd';
import LoadingAd from '../LoadingAd';

interface NativeAdProps {
  placementId: string;
}

export const NativeAd: React.FC<NativeAdProps> = ({ placementId }) => {
  const { adContent, isLoading } = useNativeAd(placementId);

  if (isLoading || !adContent) {
    return <LoadingAd />;
  }

  return (
    <div className="bg-[#1D0C30] border border-purple-800/40 rounded-2xl p-3 flex gap-3 shadow-md relative overflow-hidden">
      {/* Small Native Badge Tag */}
      <span className="absolute top-1 right-2 text-[7px] text-gray-500 font-bold bg-black/40 px-1 rounded uppercase">SPONSORED</span>

      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
        🎲
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-[10px] font-black text-amber-200 uppercase tracking-wide leading-none">{adContent.title}</h4>
          <p className="text-[8px] text-purple-300 mt-1 leading-snug">{adContent.body}</p>
        </div>
        
        <button className="mt-2 py-1 px-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-[8px] uppercase rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all self-start">
          {adContent.callToAction}
        </button>
      </div>
    </div>
  );
};
export default NativeAd;
