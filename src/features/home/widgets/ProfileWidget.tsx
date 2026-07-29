import React from "react";
import { useUserStore } from "../../../user/user.store";
import { Avatar, Badge, Flex } from "../../../components/ui";

export const ProfileWidget: React.FC = () => {
  const user = useUserStore((s) => s.user);
  if (!user) return null;

  return (
    <Flex className="gap-3">
      <Avatar name={user.username} size="md" isOnline badge="VIP" />
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-white text-base leading-tight">{user.username}</h3>
          <Badge variant="amber">Rank #{user.rank}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Level 24</span>
          <span>•</span>
          <span className="text-emerald-400">Online</span>
        </div>
      </div>
    </Flex>
  );
};
