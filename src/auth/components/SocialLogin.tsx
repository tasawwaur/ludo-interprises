import React from 'react';
import { AuthData } from '../constants/authData';

interface SocialLoginProps {
  onSelectProvider: (providerId: string) => void;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({ onSelectProvider }) => {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Divider OR CONTINUE WITH */}
      <div className="flex items-center w-full">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#5B174D] to-[#5B174D]"></div>
        <span className="px-4 text-[11px] font-black text-purple-300 uppercase tracking-[0.2em] drop-shadow-sm">
          OR CONTINUE WITH
        </span>
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#5B174D] to-[#5B174D]"></div>
      </div>

      {/* Social Buttons Row */}
      <div className="flex justify-center gap-4 w-full">
        {/* We assume AuthData.SOCIAL_PROVIDERS contains objects with at least { id, name, icon } */}
        <button
          type="button"
          onClick={() => onSelectProvider('google')}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-100 text-slate-900 rounded-xl font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <span className="text-xl">G</span>
          <span>Google</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectProvider('apple')}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-black hover:bg-gray-900 text-white border border-gray-800 rounded-xl font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <span className="text-xl"></span>
          <span>Apple</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectProvider('facebook')}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <span className="text-xl">f</span>
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
};
