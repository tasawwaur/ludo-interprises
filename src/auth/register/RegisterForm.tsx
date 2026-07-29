import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button, Input, Card, Title, Subtitle } from "../../components/ui";

export const RegisterForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { register, isLoading, error } = useAuth();
  const [username, setUsername] = useState("LudoChampion");
  const [email, setEmail] = useState("champion@ludo.com");
  const [password, setPassword] = useState("password123");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ username, email, password });
      if (onSuccess) onSuccess();
    } catch (err) {}
  };

  return (
    <Card variant="glass" className="max-w-md w-full mx-auto p-8 shadow-2xl">
      <Title className="mb-1 text-center">Create Account</Title>
      <Subtitle className="mb-6 text-center">Join millions of Ludo Enterprise players</Subtitle>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="LudoKing"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button variant="primary" size="lg" type="submit" isLoading={isLoading} className="mt-2">
          Create Free Account
        </Button>
      </form>
    </Card>
  );
};
