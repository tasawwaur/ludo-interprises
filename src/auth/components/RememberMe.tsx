import React from 'react';

interface RememberMeProps {
  rememberMe: boolean;
  onRememberMeChange: (checked: boolean) => void;
  onForgotPasswordClick?: () => void;
}

export const RememberMe: React.FC<RememberMeProps> = ({
  rememberMe,
  onRememberMeChange,
  onForgotPasswordClick,
}) => {
  return (
    <div className="flex items-center justify-between w-full text-[13px] px-1">
      <label className="flex items-center gap-2.5 text-purple-200 font-semibold cursor-pointer select-none group">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="peer appearance-none w-5 h-5 border-2 border-[#5B174D] rounded bg-[#12061F] checked:bg-amber-500 checked:border-amber-400 transition-colors cursor-pointer"
          />
          <svg className="absolute w-3.5 h-3.5 text-slate-900 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="group-hover:text-white transition-colors">Remember Me</span>
      </label>

      <button
        type="button"
        onClick={onForgotPasswordClick}
        className="text-amber-400 font-bold hover:text-amber-300 hover:underline underline-offset-2 transition-all drop-shadow-sm"
      >
        Forgot Password?
      </button>
    </div>
  );
};
