import React from 'react';

export const RulesCard: React.FC = () => {
  return (
    <div className="bg-purple-950/40 border border-purple-900/30 rounded-2xl p-4 flex flex-col gap-2.5">
      <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">CHAMPIONSHIP RULES</span>
      
      <ul className="flex flex-col gap-1.5 list-disc pl-4 text-[9px] text-purple-200 font-bold leading-normal">
        <li>All players must complete their match within the specified timeframe.</li>
        <li>Disconnecting or leaving early will result in an automatic match forfeit.</li>
        <li>Standard 2-Player Ludo rules apply: rollout matches, no safe zones shortcuts.</li>
        <li>Trophy rewards are distributed immediately to the wallet upon bracket updates.</li>
      </ul>
    </div>
  );
};
export default RulesCard;
