import React from 'react';
import { useInventory } from '../hooks/useInventory';

export const InventoryWidget: React.FC = () => {
  const { ownedDice, ownedSkins } = useInventory();

  return (
    <div className="bg-purple-950/40 border border-purple-900/30 rounded-2xl p-3 flex justify-around text-center">
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Dice Owned</span>
        <span className="text-sm font-black text-white">{ownedDice.length}</span>
      </div>
      <div className="w-[1px] bg-purple-900/40 self-stretch"></div>
      <div className="flex flex-col">
        <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Skins Owned</span>
        <span className="text-sm font-black text-white">{ownedSkins.length}</span>
      </div>
    </div>
  );
};
export default InventoryWidget;
