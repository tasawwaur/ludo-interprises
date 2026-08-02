import React from 'react';

interface SocialLoginProps {
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({ onGoogleLogin, onFacebookLogin }) => {
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
        {/* Google Login */}
        <button
          type="button"
          onClick={onGoogleLogin}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-100 text-slate-900 rounded-xl font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          {/* Google 'G' SVG icon */}
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>Google</span>
        </button>

        {/* Facebook Login */}
        <button
          type="button"
          onClick={onFacebookLogin}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          {/* Facebook 'f' SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
};
