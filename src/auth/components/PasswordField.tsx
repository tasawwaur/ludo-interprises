import React, { useState } from 'react';

interface PasswordFieldProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  placeholder = 'Password',
  value,
  onChange,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full group">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl filter drop-shadow-md transition-transform group-focus-within:scale-110">
        🔒
      </span>
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full pl-12 pr-12 py-3.5 bg-[#12061F]/80 border-2 border-[#5B174D] rounded-xl text-white font-bold text-[15px] placeholder-purple-300/50 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all shadow-inner"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-70 hover:opacity-100 hover:scale-110 transition-all focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? '👁️' : '👁️'}
      </button>
    </div>
  );
};
