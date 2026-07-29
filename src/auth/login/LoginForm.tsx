import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button, Input, Card, Title, Subtitle } from "../../components/ui";

export const LoginForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("player@ludo.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      if (onSuccess) onSuccess();
    } catch (err) {}
  };

  return (
    <Card variant="glass" className="max-w-md w-full mx-auto p-8 shadow-2xl">
      <Title className="mb-1 text-center">Welcome Back</Title>
      <Subtitle className="mb-6 text-center">Enter your details to sign in</Subtitle>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-xs font-bold text-slate-400 hover:text-white"
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </div>

        <Button variant="neon" size="lg" type="submit" isLoading={isLoading} className="mt-2">
          Sign In
        </Button>
      </form>
    </Card>
  );
};
