import React from "react";
import { Card, Avatar, Badge, Button } from "../../../components/ui";

export const OnlineFriends: React.FC = () => {
  const friends = [
    { name: "Rahul_King", status: "In 4P Match", rank: 12 },
    { name: "Priya_Pro", status: "Lobby Idle", rank: 34 },
    { name: "Vikram99", status: "Lobby Idle", rank: 58 }
  ];

  return (
    <Card variant="solid" className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-white text-sm">Online Friends ({friends.length})</h4>
        <span className="text-xs text-indigo-400 font-semibold cursor-pointer">View All</span>
      </div>
      <div className="flex flex-col gap-3">
        {friends.map((f, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-3">
              <Avatar name={f.name} size="sm" isOnline />
              <div>
                <span className="font-bold text-white text-xs block">{f.name}</span>
                <span className="text-[10px] text-slate-400">{f.status}</span>
              </div>
            </div>
            <Button variant="glass" size="sm">Invite</Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
