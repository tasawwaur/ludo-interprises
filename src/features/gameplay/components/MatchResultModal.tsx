import React from 'react';
import { useGameStore } from '../../../store/game.store';
import { useUserStore } from '../../../user/user.store';
import { Button, Card, Flex, Title, Subtitle, Badge } from '../../../components/ui';

export const MatchResultModal: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const gameState = useGameStore((s) => s.gameState);
  const resetMatch = useGameStore((s) => s.resetMatch);

  if (!gameState || gameState.gameStatus !== 'GAME_OVER') return null;

  const winnerColor = gameState.winnerRankings[0] || 'RED';
  const winnerPlayer = gameState.players.find((p) => p.color === winnerColor);

  const handlePlayAgain = () => {
    const user = useUserStore.getState().user;
    const host = gameState.players.find((p) => p.isHost)?.name || user?.username || 'Player 1';
    useGameStore.getState().startMatch(gameState.mode, host);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card variant="solid" className="max-w-md w-full p-8 border-2 border-amber-500/50 shadow-2xl text-center">
        <div className="text-6xl mb-4 animate-bounce">🏆</div>
        <Title className="text-3xl text-amber-400 font-black">VICTORY!</Title>
        <Subtitle className="mt-1 text-slate-300">
          {winnerPlayer?.name} ({winnerColor}) won the match!
        </Subtitle>

        <div className="my-6 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-2">
          <Flex className="justify-between text-sm">
            <span className="text-slate-400">Match XP Earned:</span>
            <span className="font-bold text-emerald-400">+450 XP</span>
          </Flex>
          <Flex className="justify-between text-sm">
            <span className="text-slate-400">Coins Reward:</span>
            <span className="font-bold text-amber-400">+1,200 Coins</span>
          </Flex>
          <Flex className="justify-between text-sm">
            <span className="text-slate-400">Mode:</span>
            <Badge variant="indigo">{gameState.mode} Classic</Badge>
          </Flex>
        </div>

        <Flex className="gap-3">
          <Button variant="glass" size="lg" className="w-1/2" onClick={() => { resetMatch(); onBackToHome(); }}>
            Back to Home
          </Button>
          <Button variant="neon" size="lg" className="w-1/2" onClick={handlePlayAgain}>
            Play Again
          </Button>
        </Flex>
      </Card>
    </div>
  );
};
