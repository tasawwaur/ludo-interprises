import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../../store/game.store';
import { BoardCanvasRenderer } from '../../../game/renderer/BoardCanvasRenderer';
import { getPixelCoordinates } from '../../../game/board/BoardCoordinates';

export const LudoCanvasBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameState = useGameStore((s) => s.gameState);
  const localPlayerColor = useGameStore((s) => s.localPlayerColor);
  const activeHoverTokenId = useGameStore((s) => s.activeHoverTokenId);
  const selectedTokenId = useGameStore((s) => s.selectedTokenId);
  const setHoverToken = useGameStore((s) => s.setHoverToken);
  const setSelectedToken = useGameStore((s) => s.setSelectedToken);
  const moveToken = useGameStore((s) => s.moveToken);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new BoardCanvasRenderer(ctx, canvas.width, canvas.height);
    let animFrameId: number;

    const renderLoop = () => {
      renderer.render(gameState, localPlayerColor, activeHoverTokenId, selectedTokenId);
      animFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [gameState, localPlayerColor, activeHoverTokenId, selectedTokenId]);

  if (!gameState) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState.gameStatus !== 'MOVE_WAIT') return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cellSize = canvas.width / 15;

    // Search if click matches any moveable token
    let matchedTokenId: string | null = null;
    for (const move of gameState.movableTokens) {
      const activePlayer = gameState.players[gameState.activePlayerIndex];
      const token = activePlayer.tokens.find((t) => t.id === move.tokenId);
      if (!token) continue;

      const coords = getPixelCoordinates(token.color, token.stepCount, token.index, cellSize, localPlayerColor);
      // Account for vertical height of 3D token model/sprite
      const tokenCenterY = coords.y - cellSize * 0.3;
      const dist = Math.hypot(clickX - coords.x, clickY - tokenCenterY);

      if (dist <= cellSize * 0.95) {
        matchedTokenId = token.id;
        break;
      }
    }

    if (matchedTokenId) {
      setSelectedToken(matchedTokenId);
      moveToken(matchedTokenId);
    } else {
      setSelectedToken(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState.gameStatus !== 'MOVE_WAIT') {
      setHoverToken(null);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cellSize = canvas.width / 15;

    let hoveredId: string | null = null;

    for (const move of gameState.movableTokens) {
      const activePlayer = gameState.players[gameState.activePlayerIndex];
      const token = activePlayer.tokens.find((t) => t.id === move.tokenId);
      if (!token) continue;

      const coords = getPixelCoordinates(token.color, token.stepCount, token.index, cellSize, localPlayerColor);
      const tokenCenterY = coords.y - cellSize * 0.3;
      const dist = Math.hypot(mouseX - coords.x, mouseY - tokenCenterY);

      if (dist <= cellSize * 0.95) {
        hoveredId = token.id;
        break;
      }
    }

    setHoverToken(hoveredId);
  };

  return (
    <div className="relative flex justify-center items-center p-2 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoverToken(null)}
        className="w-full max-w-[580px] aspect-square rounded-2xl cursor-pointer shadow-inner border border-slate-800/80"
      />
    </div>
  );
};
