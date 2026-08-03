import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUserStore } from "../../../user/user.store";
import { GLOBAL_PLAYER_DATABASE } from "../../../store/player-database.store";
import { DiceFace } from "../../gameplay/components/DiceFace";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

// ─── Game Constants ───────────────────────────────────────────────────────────
const BOARD_SIZE = 100;

// Standard snake and ladder positions
const SNAKES: Record<number, number> = {
  99: 21,
  94: 37,
  87: 24,
  76: 14,
  66: 45,
  54: 19,
  43: 18,
  40: 3,
  27: 5,
};

const LADDERS: Record<number, number> = {
  2: 23,
  8: 34,
  20: 58,
  32: 62,
  41: 79,
  56: 96,
  65: 93,
  68: 89,
  77: 98,
};

type PlayerColor = "RED" | "GREEN";
type GamePhase = "WAITING" | "PLAYING" | "FINISHED";

interface Player {
  id: PlayerColor;
  name: string;
  position: number; // 0 = start (not on board), 1-100
  color: string;
  emoji: string;
}

// ─── Board Layout Helper ─────────────────────────────────────────────────────
// Board is 10x10. Row 10 (top) = cells 91-100 (left to right)
// Row 9 = cells 81-90 (right to left), etc. (boustrophedon / snake pattern)
function cellToRowCol(cell: number): { row: number; col: number } {
  // cell: 1-100
  const zeroIdx = cell - 1; // 0-99
  const rowFromBottom = Math.floor(zeroIdx / 10); // 0 = bottom row
  const rowFromTop = 9 - rowFromBottom;
  const colInRow = zeroIdx % 10;
  const col = rowFromBottom % 2 === 0 ? colInRow : 9 - colInRow;
  return { row: rowFromTop, col };
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface SnakeLadderPageProps {
  onLeave: () => void;
}

export const SnakeLadderPage: React.FC<SnakeLadderPageProps> = ({ onLeave }) => {
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);

  const playerName = user?.displayName || user?.username || "You";

  const [botName, setBotName] = useState(() => {
    const botProfile = GLOBAL_PLAYER_DATABASE[Math.floor(Math.random() * GLOBAL_PLAYER_DATABASE.length)];
    return botProfile ? botProfile.username : "Rahul Sharma";
  });

  const [players, setPlayers] = useState<Player[]>([
    { id: "RED", name: playerName, position: 0, color: "#EF4444", emoji: "🔴" },
    { id: "GREEN", name: botName, position: 0, color: "#22C55E", emoji: "🟢" },
  ]);

  const [currentTurn, setCurrentTurn] = useState<PlayerColor>("RED");
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>("PLAYING");
  const [message, setMessage] = useState("🎲 Your turn! Roll the dice.");
  const [isRolling, setIsRolling] = useState(false);
  const [highlightCell, setHighlightCell] = useState<number | null>(null);
  const [snakeAnimation, setSnakeAnimation] = useState<number | null>(null);
  const [ladderAnimation, setLadderAnimation] = useState<number | null>(null);
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = useCallback((entry: string) => {
    setMoveLog((prev) => [entry, ...prev].slice(0, 20));
  }, []);

  const movePiece = useCallback(
    (playerColor: PlayerColor, rolled: number) => {
      setPlayers((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== playerColor) return p;

          const newPos = p.position + rolled;

          // Overshoot: can't go past 100
          if (newPos > 100) {
            setMessage(`${p.name} rolled ${rolled} — overshoots! Stay at ${p.position}.`);
            addLog(`${p.emoji} ${p.name}: rolled ${rolled} → stayed at ${p.position} (overshoot)`);
            return p;
          }

          let finalPos = newPos;

          // Check snake
          if (SNAKES[finalPos]) {
            const snakeDest = SNAKES[finalPos];
            setSnakeAnimation(finalPos);
            setTimeout(() => setSnakeAnimation(null), 1200);
            setMessage(`🐍 SNAKE! ${p.name} slips from ${finalPos} → ${snakeDest}!`);
            addLog(`🐍 ${p.emoji} ${p.name}: rolled ${rolled} → ${finalPos} → SNAKE → ${snakeDest}`);
            finalPos = snakeDest;
            return { ...p, position: finalPos };
          }

          // Check ladder
          if (LADDERS[finalPos]) {
            const ladderDest = LADDERS[finalPos];
            setLadderAnimation(finalPos);
            setTimeout(() => setLadderAnimation(null), 1200);
            setMessage(`🪜 LADDER! ${p.name} climbs from ${finalPos} → ${ladderDest}!`);
            addLog(`🪜 ${p.emoji} ${p.name}: rolled ${rolled} → ${finalPos} → LADDER → ${ladderDest}`);
            finalPos = ladderDest;
            return { ...p, position: finalPos };
          }

          setMessage(`${p.emoji} ${p.name} moved to ${finalPos}.`);
          addLog(`${p.emoji} ${p.name}: rolled ${rolled} → ${finalPos}`);
          return { ...p, position: finalPos };
        });

        return updated;
      });
    },
    [addLog]
  );

  const checkWin = useCallback(
    (updatedPlayers: Player[]) => {
      const winner = updatedPlayers.find((p) => p.position === 100);
      if (winner) {
        setPhase("FINISHED");
        setMessage(`🏆 ${winner.name} wins the match!`);
        addLog(`🏆 ${winner.emoji} ${winner.name} WON!`);
        if (winner.id === "RED") {
          const coins = user?.coins || 0;
          updateUser({ coins: coins + 5000 });
        }
      }
    },
    [addLog, user, updateUser]
  );

  // Watch position changes to detect win
  useEffect(() => {
    checkWin(players);
  }, [players, checkWin]);

  // Bot turn logic
  useEffect(() => {
    if (currentTurn !== "GREEN" || phase !== "PLAYING") return;

    botTimerRef.current = setTimeout(() => {
      const botRoll = Math.ceil(Math.random() * 6);
      setDiceValue(botRoll);
      setIsRolling(true);
      setTimeout(() => {
        setIsRolling(false);
        movePiece("GREEN", botRoll);
        setCurrentTurn("RED");
        setMessage("🎲 Your turn! Roll the dice.");
      }, 800);
    }, 1200);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [currentTurn, phase, movePiece]);

  const handleRoll = () => {
    if (currentTurn !== "RED" || isRolling || phase !== "PLAYING") return;

    setIsRolling(true);
    const rolled = Math.ceil(Math.random() * 6);

    // Animate dice roll
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      setDiceValue(Math.ceil(Math.random() * 6));
      flashCount++;
      if (flashCount >= 8) {
        clearInterval(flashInterval);
        setDiceValue(rolled);
        setIsRolling(false);
        movePiece("RED", rolled);
        setCurrentTurn("GREEN");
      }
    }, 80);
  };

  const resetGame = () => {
    const newBotProfile = GLOBAL_PLAYER_DATABASE[Math.floor(Math.random() * GLOBAL_PLAYER_DATABASE.length)];
    const nameToUse = newBotProfile ? newBotProfile.username : "Rahul Sharma";
    setBotName(nameToUse);
    setPlayers([
      { id: "RED", name: playerName, position: 0, color: "#EF4444", emoji: "🔴" },
      { id: "GREEN", name: nameToUse, position: 0, color: "#22C55E", emoji: "🟢" },
    ]);
    setCurrentTurn("RED");
    setDiceValue(null);
    setPhase("PLAYING");
    setMessage("🎲 Your turn! Roll the dice.");
    setMoveLog([]);
  };

  // ─── Render board ───────────────────────────────────────────────────────────
  const renderBoard = () => {
    const cells: React.ReactNode[] = [];

    for (let cell = 100; cell >= 1; cell--) {
      const { row, col } = cellToRowCol(cell);

      const redHere = players[0].position === cell;
      const greenHere = players[1].position === cell;
      const isSnakeHead = Object.keys(SNAKES).includes(String(cell));
      const isSnakeTail = Object.values(SNAKES).includes(cell);
      const isLadderBase = Object.keys(LADDERS).includes(String(cell));
      const isLadderTop = Object.values(LADDERS).includes(cell);
      const isHighlighted = highlightCell === cell;
      const isSnakeAnim = snakeAnimation === cell;
      const isLadderAnim = ladderAnimation === cell;
      const isCentenary = cell === 100;

      let cellBg = "bg-slate-900/60";
      let border = "border-slate-700/30";
      if (isSnakeHead) { cellBg = "bg-red-950/80"; border = "border-red-500/50"; }
      if (isSnakeTail) { cellBg = "bg-red-900/30"; border = "border-red-400/20"; }
      if (isLadderBase) { cellBg = "bg-yellow-950/80"; border = "border-yellow-400/50"; }
      if (isLadderTop) { cellBg = "bg-yellow-900/30"; border = "border-yellow-300/20"; }
      if (isCentenary) { cellBg = "bg-gradient-to-br from-amber-500/30 to-yellow-600/20"; border = "border-amber-400/60"; }
      if (isSnakeAnim) { cellBg = "bg-red-500/50 animate-pulse"; }
      if (isLadderAnim) { cellBg = "bg-yellow-400/50 animate-pulse"; }

      cells.push(
        <div
          key={cell}
          data-cell={cell}
          style={{ gridRow: row + 1, gridColumn: col + 1 }}
          className={`relative flex flex-col items-center justify-center ${cellBg} border ${border} rounded-[4px] transition-all duration-200 ${isHighlighted ? "ring-2 ring-amber-400 scale-105" : ""}`}
        >
          {/* Cell number */}
          <span className={`text-[7px] font-black leading-none ${isCentenary ? "text-amber-300" : "text-slate-500"} select-none`}>
            {isCentenary ? "🏆" : cell}
          </span>

          {/* Snake/Ladder indicator */}
          {isSnakeHead && <span className="text-[8px] leading-none select-none">🐍</span>}
          {isLadderBase && <span className="text-[8px] leading-none select-none">🪜</span>}

          {/* Player tokens */}
          <div className="flex gap-[2px] justify-center items-center">
            {redHere && (
              <img
                src="/assets/images/icons/token_red_3d.png"
                alt="RED"
                className="w-4 h-4 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] animate-bounce"
                draggable={false}
              />
            )}
            {greenHere && (
              <img
                src="/assets/images/icons/token_green_3d.png"
                alt="GREEN"
                className="w-4 h-4 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] animate-bounce"
                draggable={false}
              />
            )}
          </div>
        </div>
      );
    }
    return cells;
  };

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Universal Luxury Background */}
      <LudoPageBackground variant="gameplay" />

      {/* Snake & Ladders Custom Board Card overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none z-0"
        style={{ backgroundImage: "url('/assets/images/backgrounds/luxury_snake_board.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07010f]/40 via-transparent to-[#07010f]/80 pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={onLeave}
          className="w-9 h-9 rounded-full bg-slate-900/80 border border-amber-500/30 flex items-center justify-center text-amber-200 text-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          ←
        </button>
        <h1 className="text-base font-black bg-gradient-to-r from-emerald-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent tracking-widest uppercase">
          🐍 Snakes & Ladders
        </h1>
        <button
          onClick={resetGame}
          className="w-9 h-9 rounded-full bg-slate-900/80 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          title="Restart"
        >
          ↺
        </button>
      </div>

      {/* Player score bar */}
      <div className="relative z-10 flex items-center justify-between px-4 mb-2 gap-3">
        {players.map((p) => (
          <div
            key={p.id}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${
              currentTurn === p.id && phase === "PLAYING"
                ? "border-amber-400/70 bg-amber-400/10 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                : "border-slate-700/40 bg-slate-900/40"
            }`}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white/30 shadow-lg flex-shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <div className="min-w-0">
              <div className="text-[9px] font-black text-white truncate">{p.name}</div>
              <div className="text-[8px] text-slate-400">
                {p.position === 0 ? "Start" : p.position === 100 ? "🏆 Winner!" : `Cell ${p.position}`}
              </div>
            </div>
            {currentTurn === p.id && phase === "PLAYING" && (
              <div className="ml-auto text-amber-300 text-[10px] animate-pulse font-black">▶</div>
            )}
          </div>
        ))}
      </div>

      {/* Game Board */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-3">
        <div
          className="grid w-full border border-amber-500/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gridTemplateRows: "repeat(10, 1fr)",
            aspectRatio: "1 / 1",
            maxWidth: "360px",
            backgroundColor: "rgba(10,2,25,0.9)",
          }}
        >
          {renderBoard()}
        </div>
      </div>

      {/* Legend */}
      <div className="relative z-10 flex items-center justify-center gap-4 px-4 py-1">
        <div className="flex items-center gap-1">
          <span className="text-xs">🐍</span>
          <span className="text-[9px] text-red-400 font-black">= Snake (go down)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs">🪜</span>
          <span className="text-[9px] text-yellow-400 font-black">= Ladder (go up)</span>
        </div>
      </div>

      {/* Status message */}
      <div className="relative z-10 px-4 py-1">
        <div className="bg-slate-900/70 border border-amber-500/20 rounded-xl px-3 py-2 text-center">
          <p className="text-[10px] font-black text-amber-200 leading-snug">{message}</p>
        </div>
      </div>

      {/* Dice + Roll Button */}
      <div className="relative z-10 flex items-center justify-center gap-6 px-4 py-3">
        {/* Dice face display */}
        <div className="flex-shrink-0">
          <DiceFace
            value={diceValue}
            isRolling={isRolling}
            diceId="dice_emperor"
            size={56}
          />
        </div>

        {/* Roll button or waiting indicator */}
        {phase === "FINISHED" ? (
          <button
            onClick={resetGame}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm uppercase tracking-widest shadow-[0_4px_16px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.97] transition-all cursor-pointer border-0 outline-none"
          >
            🔄 Play Again
          </button>
        ) : currentTurn === "RED" ? (
          <button
            onClick={handleRoll}
            disabled={isRolling}
            className={`flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-0 outline-none ${
              isRolling
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 text-slate-950 shadow-[0_4px_16px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
            }`}
          >
            {isRolling ? "Rolling..." : "🎲 Roll Dice"}
          </button>
        ) : (
          <div className="flex-1 py-3.5 rounded-2xl bg-slate-800/60 border border-emerald-500/20 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Bot is thinking...</span>
          </div>
        )}
      </div>

      {/* Move log */}
      {moveLog.length > 0 && (
        <div className="relative z-10 px-4 pb-4">
          <div className="bg-slate-900/60 border border-slate-700/30 rounded-xl p-2 max-h-[72px] overflow-y-auto no-scrollbar">
            {moveLog.map((log, i) => (
              <div key={i} className={`text-[8px] text-slate-400 leading-relaxed ${i === 0 ? "text-amber-300 font-black" : ""}`}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeLadderPage;
