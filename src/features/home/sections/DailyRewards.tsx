import React, { useState } from "react";
import { Card, Button, Badge } from "../../../components/ui";

export const DailyRewards: React.FC = () => {
  const [claimed, setClaimed] = useState(false);

  return (
    <Card variant="glass" className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl">
          🎁
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-sm">Daily Bonus</h4>
            <Badge variant="amber">Day 4</Badge>
          </div>
          <p className="text-xs text-slate-400">Claim 500 Gold Coins + 10 Gems today!</p>
        </div>
      </div>
      <Button
        variant={claimed ? "secondary" : "amber"}
        size="sm"
        disabled={claimed}
        onClick={() => setClaimed(true)}
      >
        {claimed ? "Claimed ✓" : "Claim Now"}
      </Button>
    </Card>
  );
};
