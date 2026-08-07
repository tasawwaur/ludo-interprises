import React from "react";
import { useUserStore } from "../../../user/user.store";
import { Badge } from "../../../components/ui";

export const WalletWidget: React.FC = () => {
  const user = useUserStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 p-2 pl-3 pr-3 rounded-2xl">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">🪙</span>
        <span className="text-xs font-black text-amber-400">{(user.coins ?? 0).toLocaleString()}</span>
      </div>
      <span className="text-slate-700 font-bold">|</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm">💎</span>
        <span className="text-xs font-black text-cyan-400">{(user.gems ?? 0).toLocaleString()}</span>
      </div>
    </div>
  );
};
