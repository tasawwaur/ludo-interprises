import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../store/game.store';
import { Button, Card, Flex, Title, Badge } from '../../../components/ui';

export const DiceControl: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const rollDice = useGameStore((s) => s.rollDice);
  const moveToken = useGameStore((s) => s.moveToken);
  const isMuted = useGameStore((s) => s.isMuted);
  const toggleMute = useGameStore((s) => s.toggleMute);

  const [turnTimer, setTurnTimer] = useState<number>(30);

  useEffect(() => {
    setTurnTimer(30);
    const interval = setInterval(() => {
      setTurnTimer((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState?.activePlayerIndex, gameState?.currentTurnColor]);

  if (!gameState) return null;

  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const isHumanTurn = !activePlayer.isAi;
  const canRoll = isHumanTurn && gameState.gameStatus === 'ROLL_WAIT' && !gameState.isDiceRolled;

  const colorBadgeVariants: Record<string, 'rose' | 'emerald' | 'amber' | 'cyan'> = {
    RED: 'rose',
    GREEN: 'emerald',
    YELLOW: 'amber',
    BLUE: 'cyan',
  };

  return (
    <Card variant="solid" className="p-5 border border-slate-800 shadow-xl bg-slate-900/90 backdrop-blur-xl">
      {/* Turn Header & Mute Button */}
      <Flex className="justify-between items-center mb-4">
        <div>
          <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Current Turn</span>
          <Title className="text-lg flex items-center gap-2">
            {activePlayer.name}
            <Badge variant={colorBadgeVariants[activePlayer.color]}>
              {activePlayer.color}
            </Badge>
          </Title>
        </div>

        <Button
          variant="glass"
          size="sm"
          onClick={toggleMute}
          className="text-xs font-bold border-slate-700"
        >
          {isMuted ? '🔇 Muted' : '🔊 Sound ON'}
        </Button>
      </Flex>

      {/* FEATURE 10: Turn Timer Countdown */}
      <div className="mb-4 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
        <span className="text-xs text-slate-400 font-semibold">Remaining Turn Time</span>
        <span className={`text-xs font-mono font-black ${turnTimer <= 5 ? 'text-rose-500 animate-ping' : 'text-amber-400'}`}>
          ⏱️ 00:{turnTimer < 10 ? `0${turnTimer}` : turnTimer}s
        </span>
      </div>

      {/* FEATURE 3: Dice Panel (Current vs Last Dice) */}
      <Flex className="justify-between items-center bg-slate-950/60 p-3 rounded-2xl border border-slate-800 mb-4">
        <div>
          <span className="text-[11px] text-slate-400 block font-semibold">Last Dice Roll</span>
          <span className="text-base font-extrabold text-slate-300 font-mono">
            {gameState.lastDiceValue ? `🎲 ${gameState.lastDiceValue}` : 'None'}
          </span>
        </div>

        {/* 3D Dice Face Display */}
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl border-2 border-amber-400/50 shadow-2xl">
          {gameState.diceValue ? (
            <span className="text-3xl font-black text-amber-400 drop-shadow-md animate-bounce">
              {gameState.diceValue}
            </span>
          ) : (
            <span className="text-2xl font-bold text-slate-500">🎲</span>
          )}
        </div>
      </Flex>

      {/* FEATURE 3: Roll Button Disabled during opponent turn */}
      {canRoll ? (
        <Button
          variant="neon"
          size="lg"
          className="w-full font-extrabold text-base tracking-wide py-3.5 animate-pulse shadow-lg"
          onClick={rollDice}
        >
          🎲 ROLL DICE NOW
        </Button>
      ) : (
        <Button
          variant="glass"
          size="lg"
          disabled
          className="w-full font-bold text-sm py-3 opacity-50 cursor-not-allowed border-slate-800"
        >
          {isHumanTurn ? 'Select Movable Token Below' : '🤖 Opponent Turn In Progress'}
        </Button>
      )}

      {/* FEATURE 4 & 10: Movable Token Hints */}
      {isHumanTurn && gameState.gameStatus === 'MOVE_WAIT' && (
        <div className="mt-3">
          <span className="text-xs text-amber-400 font-bold block mb-2 text-center">
            💡 Select valid token to move ({gameState.movableTokens.length} option):
          </span>
          <Flex className="gap-2 flex-wrap justify-center">
            {gameState.movableTokens.map((move) => (
              <Button
                key={move.tokenId}
                variant="glass"
                size="sm"
                className="border-indigo-500/50 hover:bg-indigo-500/20 text-xs font-bold"
                onClick={() => moveToken(move.tokenId)}
              >
                Token {move.tokenId} ({move.fromStep === 0 ? 'Yard ➔ Start' : `+${gameState.diceValue} steps`})
              </Button>
            ))}
          </Flex>
        </div>
      )}

      {/* Move Summary Log */}
      <p className="text-[11px] text-slate-400 mt-4 text-center border-t border-slate-800/80 pt-2 italic">
        {gameState.lastActionSummary}
      </p>
    </Card>
  );
};
