import React, { useState } from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { useDice } from '../hooks/useDice';
import { useRoll } from '../hooks/useRoll';
import { useSkins } from '../hooks/useSkins';
import { useUserStore } from '../../../user/user.store';
import { DicePreview } from '../components/DicePreview';
import { DiceSelector } from '../components/DiceSelector';
import { RollButton } from '../components/Roll/RollButton';
import { RollAnimation } from '../components/Roll/RollAnimation';
import { DiceResult } from '../components/Roll/DiceResult';
import { RollHistory } from '../components/Roll/RollHistory';
import { DiceCollection } from '../sections/DiceCollection';
import { FeaturedDice } from '../sections/FeaturedDice';
import { DiceEffects } from '../sections/DiceEffects';
import { DiceHistory } from '../sections/DiceHistory';
import confetti from 'canvas-confetti';

interface DicePageProps {
  onBack?: () => void;
}

export const DicePage: React.FC<DicePageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'ROLL' | 'COLLECTION' | 'SKINS' | 'STATS'>('ROLL');
  
  const { diceItems, equippedDiceId, equipDice, unlockDice } = useDice();
  const { currentValue, isRolling, rollHistory, stats, rollActiveDice } = useRoll();
  const { skins, equippedSkins, equipSkin, unlockSkin } = useSkins();
  const user = useUserStore((s) => s.user);

  const equippedDice = diceItems.find((d) => d.id === equippedDiceId) || diceItems[0];
  const userCoins = user?.coins || 0;
  const userGems = user?.gems || 0;

  const handleRoll = () => {
    if (isRolling) return;
    const value = rollActiveDice();
    
    // Celebratory effect if user rolls a 6
    setTimeout(() => {
      if (value === 6) {
        confetti({
          particleCount: 20,
          spread: 30,
          colors: ['#FFD700', '#FFA500'],
        });
      }
    }, 600);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ROLL':
        return (
          <div className="flex flex-col gap-4">
            <DicePreview dice={equippedDice} isRolling={isRolling} />
            <DiceResult value={currentValue} />
            <RollAnimation isRolling={isRolling} value={currentValue} />
            <RollButton onRoll={handleRoll} disabled={isRolling} />
            
            {rollHistory.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider">Roll Log</span>
                <RollHistory history={rollHistory} />
              </div>
            )}
          </div>
        );

      case 'COLLECTION':
        return (
          <DiceCollection
            diceItems={diceItems}
            equippedId={equippedDiceId}
            onEquip={(id) => equipDice(id)}
            onUnlock={(id) => unlockDice(id)}
            userCoins={userCoins}
          />
        );

      case 'SKINS':
        return (
          <DiceEffects
            skins={skins}
            equippedSkins={equippedSkins}
            onEquipSkin={(diceId, skinId) => equipSkin(diceId, skinId)}
            onUnlockSkin={(skinId) => unlockSkin(skinId)}
            userCoins={userCoins}
            userGems={userGems}
          />
        );

      case 'STATS':
        return (
          <DiceHistory stats={stats} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="shop" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            DICE WORKSHOP
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Ornate Tab Menu */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl">
          {([
            { id: 'ROLL', label: 'Roll' },
            { id: 'COLLECTION', label: 'Dice' },
            { id: 'SKINS', label: 'Skins' },
            { id: 'STATS', label: 'Stats' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg border border-yellow-200'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};
export default DicePage;
