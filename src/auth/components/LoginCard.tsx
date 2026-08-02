import React, { useState } from 'react';
import { InputField } from './InputField';
import { PasswordField } from './PasswordField';
import { RememberMe } from './RememberMe';
import { PlayButton } from './PlayButton';
import { SocialLogin } from './SocialLogin';
import { GuestLogin } from './GuestLogin';
import { CreateAccount } from './CreateAccount';

interface LoginCardProps {
  onLoginSubmit: (username: string, pass: string) => void;
  onGuestLogin: () => void;
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
  onToggleRegister: () => void;
  isLoading?: boolean;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onLoginSubmit,
  onGuestLogin,
  onGoogleLogin,
  onFacebookLogin,
  onToggleRegister,
  isLoading = false,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    onLoginSubmit(username.trim(), password);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto bg-gradient-to-br from-[#2A0B34]/95 to-[#12061F]/95 border border-purple-500/50 rounded-3xl p-6 shadow-[0_0_30px_rgba(255,193,7,0.15),0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl z-10 flex flex-col gap-5 relative overflow-hidden">
      {/* Top Gold Border Glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_15px_rgba(255,213,79,1)]"></div>

      {/* Welcome Text Header */}
      <div className="text-center relative">
        <h2 className="text-3xl font-black tracking-wide text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          WELCOME BACK!
        </h2>
        <div className="flex items-center justify-center gap-3 mt-1.5">
          <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-yellow-400/80"></div>
          <span className="text-sm font-bold text-amber-400 tracking-wide drop-shadow-md">
            Login to continue your journey
          </span>
          <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-yellow-400/80"></div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <InputField
          icon="👤"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <PasswordField
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="mt-1">
          <RememberMe
            rememberMe={rememberMe}
            onRememberMeChange={setRememberMe}
            onForgotPasswordClick={() => alert('Password reset link sent to your email!')}
          />
        </div>

        <div className="mt-2">
          <PlayButton label="PLAY NOW" isLoading={isLoading} />
        </div>
      </form>

      {/* Social Login Options */}
      <SocialLogin
        onGoogleLogin={onGoogleLogin}
        onFacebookLogin={onFacebookLogin}
      />

      {/* Guest Login Option */}
      <div className="mt-1">
        <GuestLogin onClick={onGuestLogin} />
      </div>

      {/* Create Account Link */}
      <div className="mt-2 border-t border-purple-500/20 pt-4">
        <CreateAccount onToggle={onToggleRegister} />
      </div>
    </div>
  );
};
