import React, { useState } from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { RoundStructure } from '../types/bracket.types';
import BracketTree from '../components/Brackets/BracketTree';
import ResultDialog from '../components/Dialogs/ResultDialog';
import { useBracket } from '../hooks/useBracket';
import confetti from 'canvas-confetti';

interface BracketPageProps {
  onBack?: () => void;
  onFinishedTournament?: () => void;
  onJoinMatch?: (mode: string) => void;
}

export const BracketPage: React.FC<BracketPageProps> = ({
  onBack,
  onFinishedTournament,
  onJoinMatch,
}) => {
  const { rounds, completeMatch } = useBracket();
  const [showResult, setShowResult] = useState(false);
  const [winnerName, setWinnerName] = useState('');
  const [isVictory, setIsVictory] = useState(false);

  const handlePlayMatchNode = async (matchId: string) => {
    // Simulating match play results (50% victory chance)
    const success = Math.random() > 0.5;
    setIsVictory(success);
    setWinnerName(success ? 'TASAVVUR' : 'Alok');

    if (success) {
      await completeMatch(matchId, 'user_1', 4, 2);
      confetti({
        particleCount: 30,
        spread: 40,
        colors: ['#FFD700', '#FFA500'],
      });
    } else {
      await completeMatch(matchId, 'npc_1', 1, 4);
    }
    setShowResult(true);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    if (!isVictory) {
      onBack?.();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="tournament" />

      {/* Result Dialog */}
      {showResult && (
        <ResultDialog
          isOpen={showResult}
          onClose={handleCloseResult}
          winnerName={winnerName}
          isUser={isVictory}
          prizeLabel={isVictory ? '🪙 10,000 + 👑 1' : undefined}
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
            TOURNAMENT BRACKET
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Bracket Scroll Tree Container */}
        <div className="flex-1 flex items-center justify-center pb-6">
          <BracketTree rounds={rounds} onPlayMatch={handlePlayMatchNode} />
        </div>
      </div>
    </div>
  );
};
export default BracketPage;
