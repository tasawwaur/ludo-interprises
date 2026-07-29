import React from 'react';
import CountdownTimer from '../components/CountdownTimer';
import { useTournament } from '../hooks/useTournament';

export const CountdownWidget: React.FC = () => {
  const { tournaments } = useTournament();
  const active = tournaments[0];

  if (!active) return null;

  return (
    <div className="bg-purple-950/40 border border-purple-900/30 rounded-2xl p-3 flex justify-between items-center">
      <span className="text-[10px] text-white font-black">Tournament Starts in</span>
      <CountdownTimer endTime={active.startTime} />
    </div>
  );
};
export default CountdownWidget;
