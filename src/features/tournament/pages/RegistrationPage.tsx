import React, { useState } from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { TournamentItem } from '../types/tournament.types';
import EntryFee from '../components/Registration/EntryFee';
import RulesCard from '../components/Registration/RulesCard';
import RegisterButton from '../components/Registration/RegisterButton';
import JoinDialog from '../components/Dialogs/JoinDialog';
import { useUserStore } from '../../../user/user.store';
import { canAffordEntry } from '../utils/validator';

interface RegistrationPageProps {
  tournament: TournamentItem;
  onBack?: () => void;
  onRegisterSuccess?: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  tournament,
  onBack,
  onRegisterSuccess,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const user = useUserStore((s) => s.user);
  
  const userCoins = user?.coins || 0;
  const userGems = user?.gems || 0;
  const isAffordable = canAffordEntry(tournament.entryCost, userCoins, userGems);

  const handleConfirmRegister = () => {
    setShowConfirm(false);
    onRegisterSuccess?.();
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="tournament" />

      {/* Confirmation popup dialog */}
      {showConfirm && (
        <JoinDialog
          tournament={tournament}
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmRegister}
          canAfford={isAffordable}
        />
      )}

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            REGISTRATION
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Form Container details */}
        <div className="flex-1 flex flex-col gap-4 pb-6">
          <div className="bg-purple-950/60 border-2 border-purple-500/35 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl relative">
            <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">{tournament.name}</span>
            <p className="text-[10px] text-purple-200 leading-relaxed font-bold italic">{tournament.description}</p>
            
            <EntryFee cost={tournament.entryCost} />
            <RulesCard />
            
            <RegisterButton
              onRegister={() => setShowConfirm(true)}
              disabled={!isAffordable}
              label={isAffordable ? 'REGISTER' : 'INSUFFICIENT BALANCE'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegistrationPage;
