import React from 'react';

interface RegisterButtonProps {
  onRegister: () => void;
  disabled?: boolean;
  label?: string;
}

export const RegisterButton: React.FC<RegisterButtonProps> = ({
  onRegister,
  disabled = false,
  label = 'REGISTER NOW',
}) => {
  return (
    <button
      onClick={onRegister}
      disabled={disabled}
      className={`w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-955 font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl transition-all border border-yellow-200 ${
        disabled
          ? 'opacity-50 cursor-not-allowed hover:scale-100'
          : 'hover:scale-[1.01] active:scale-95'
      }`}
    >
      {label}
    </button>
  );
};
export default RegisterButton;
