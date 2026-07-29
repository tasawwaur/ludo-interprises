import React from 'react';

interface PlayButtonProps {
  label?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  label = 'PLAY NOW',
  isLoading = false,
  onClick,
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      onClick={onClick}
      className="group relative w-full h-[60px] bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-500 rounded-2xl border-[3px] border-yellow-200 text-[#12061F] font-black text-xl tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_8px_25px_rgba(255,193,7,0.4)] hover:shadow-[0_12px_35px_rgba(255,193,7,0.6)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all overflow-hidden cursor-pointer"
    >
      {/* Gloss Overlay */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl"></div>
      
      {/* Shine Effect */}
      <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] group-hover:animate-[shine_1.5s_ease-in-out_infinite]"></div>

      {isLoading ? (
        <span className="animate-spin text-2xl relative z-10">⏳</span>
      ) : (
        <>
          <span className="relative z-10 drop-shadow-md">{label}</span>
          <span className="relative z-10 w-9 h-9 rounded-full bg-[#12061F] text-amber-400 text-lg flex items-center justify-center font-black shadow-inner group-hover:translate-x-1.5 transition-transform border border-amber-900/30">
            ➜
          </span>
        </>
      )}
    </button>
  );
};
