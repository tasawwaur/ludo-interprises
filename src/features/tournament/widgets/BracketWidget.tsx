import React from 'react';

export const BracketWidget: React.FC = () => {
  return (
    <div className="bg-purple-950/40 border border-purple-900/30 rounded-2xl p-3 flex justify-around items-center">
      <div className="flex flex-col text-center">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Tournament Round</span>
        <span className="text-sm font-black text-white">Quarterfinals</span>
      </div>
    </div>
  );
};
export default BracketWidget;
