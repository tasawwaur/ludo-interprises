import React from "react";
import { useUserStore } from "../user.store";
import { useAuth } from "../../auth/hooks/useAuth";
import { Card, Avatar, Badge, Button, Title, Subtitle, Flex, Stack } from "../../components/ui";

export const UserProfileCard: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const { logout, isLoading } = useAuth();

  if (!user) return null;

  return (
    <Card variant="gradient" className="max-w-md w-full mx-auto p-6 shadow-2xl">
      <Flex className="justify-between items-start mb-4">
        <Flex className="gap-3">
          <Avatar name={user.username} size="lg" isOnline badge="PRO" />
          <div>
            <Title className="text-xl">{user.username}</Title>
            <Subtitle>{user.email}</Subtitle>
          </div>
        </Flex>
        <Badge variant="amber">Rank #{user.rank}</Badge>
      </Flex>

      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-6">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Wallet Coins</span>
          <span className="text-base font-black text-amber-400">🪙 {user.coins.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Gems</span>
          <span className="text-base font-black text-cyan-400">💎 {user.gems.toLocaleString()}</span>
        </div>
      </div>

      <Button variant="danger" size="md" className="w-full" isLoading={isLoading} onClick={logout}>
        Sign Out
      </Button>
    </Card>
  );
};
