import { GameState, PlayerColor, Token } from '../engine/Engine.types';
import {
  OUTER_TRACK_COORDS,
  HOME_CORRIDORS,
  YARD_POSITIONS,
  SAFE_TRACK_INDICES,
  COLOR_START_INDEX,
  getPixelCoordinates,
} from '../board/BoardCoordinates';

export class BoardCanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private cellSize: number;
  private animPulseAngle = 0;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.cellSize = width / 15;
  }

  public render(
    state: GameState,
    activeHoverTokenId?: string | null,
    selectedTokenId?: string | null
  ) {
    const { ctx, width, height } = this;
    this.animPulseAngle = (this.animPulseAngle + 0.08) % (Math.PI * 2);

    ctx.clearRect(0, 0, width, height);

    // 1. Deep Magenta Beveled Outer Frame (Matching Reference Image 2)
    const framePadding = 14;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 32);
    const outerGradient = ctx.createLinearGradient(0, 0, width, height);
    outerGradient.addColorStop(0, '#9d174d'); // Bright Magenta
    outerGradient.addColorStop(0.5, '#701a75'); // Deep Purple
    outerGradient.addColorStop(1, '#4c0519'); // Dark Wine
    ctx.fillStyle = outerGradient;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#be185d';
    ctx.stroke();

    // Inner Board Stage
    ctx.save();
    ctx.translate(framePadding, framePadding);
    const innerSize = width - framePadding * 2;
    const innerCellSize = innerSize / 15;
    this.cellSize = innerCellSize;

    // White Board Canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, innerSize, innerSize);

    // 2. Corner Color Yards (EXACT MATCH to Reference Image 2)
    // Top-Left GREEN Yard (Green Background + White Circle + Green Diamond Crown)
    this.drawReferenceYard(0, 0, 6, 6, '#16a34a', 'GREEN', true);

    // Top-Right YELLOW Yard (Yellow Background + White Circle + 4 Yellow Dots)
    this.drawReferenceYard(9, 0, 6, 6, '#eab308', 'YELLOW', false);

    // Bottom-Right BLUE Yard (Blue Background + White Circle + 4 Blue Dots)
    this.drawReferenceYard(9, 9, 6, 6, '#2563eb', 'BLUE', false);

    // Bottom-Left RED Yard (Red Background + White Circle + 4 Red Dots)
    this.drawReferenceYard(0, 9, 6, 6, '#dc2626', 'RED', false);

    // 3. Outer Track Cells (White Grid with Grey Borders)
    OUTER_TRACK_COORDS.forEach((pos, idx) => {
      const x = pos.col * innerCellSize;
      const y = pos.row * innerCellSize;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, innerCellSize, innerCellSize);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, innerCellSize, innerCellSize);

      // Star Safe Tile (Luxury 3D Golden Royal Star Badge on all 8 safe stops)
      if (SAFE_TRACK_INDICES.has(idx)) {
        this.drawLuxuryStar(x + innerCellSize / 2, y + innerCellSize / 2, innerCellSize * 0.85);
      }
    });

    // 4. Home Corridors (Green left, Yellow top, Blue right, Red bottom)
    this.drawCorridor(HOME_CORRIDORS.GREEN, '#16a34a');
    this.drawCorridor(HOME_CORRIDORS.YELLOW, '#eab308');
    this.drawCorridor(HOME_CORRIDORS.BLUE, '#2563eb');
    this.drawCorridor(HOME_CORRIDORS.RED, '#dc2626');

    // 5. Center Arrows (Meeting arrows matching Reference Image 2)
    this.drawCenterArrows(innerSize, innerCellSize);

    // 6. Track Entry Curved Arrows (Matching Reference Image 2)
    this.drawCurvedTrackArrows(innerCellSize);

    // 7. Animated Turn Arrow
    this.drawTurnArrow(state.currentTurnColor);

    // 8. Destination Path Highlight
    const activeTokenId = selectedTokenId || activeHoverTokenId;
    if (activeTokenId && state.movableTokens.length > 0) {
      const move = state.movableTokens.find((m) => m.tokenId === activeTokenId);
      if (move) {
        this.drawDestinationPath(state.currentTurnColor, move.fromStep, move.toStep);
      }
    }

    // 9. Draw Player Tokens
    this.drawAllTokens(state, activeHoverTokenId, selectedTokenId);

    ctx.restore();
  }

  private static pawnImageCache: Record<string, HTMLImageElement> = {};

  private getPawnImage(color: PlayerColor): HTMLImageElement {
    const key = color.toLowerCase();
    if (!BoardCanvasRenderer.pawnImageCache[key]) {
      const img = new Image();
      img.src = `/assets/images/pawns/pawn_${key}.png`;
      BoardCanvasRenderer.pawnImageCache[key] = img;
    }
    return BoardCanvasRenderer.pawnImageCache[key];
  }

  private drawReferenceYard(
    col: number,
    row: number,
    cols: number,
    rows: number,
    colorHex: string,
    color: PlayerColor,
    hasDiamondCrown: boolean
  ) {
    const { ctx, cellSize } = this;
    const x = col * cellSize;
    const y = row * cellSize;
    const w = cols * cellSize;
    const h = rows * cellSize;

    // Outer Yard Box
    ctx.fillStyle = colorHex;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Center Large White Circle
    const cx = x + w / 2;
    const cy = y + h / 2;
    const circleRadius = cellSize * 2.1;

    ctx.beginPath();
    ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.stroke();

    if (hasDiamondCrown) {
      // Green Diamond Crown Logo inside Top-Left Yard (Matching Reference Image 2)
      ctx.save();
      ctx.translate(cx, cy);

      ctx.beginPath();
      ctx.moveTo(0, -circleRadius * 0.45);
      ctx.lineTo(circleRadius * 0.5, 0);
      ctx.lineTo(0, circleRadius * 0.45);
      ctx.lineTo(-circleRadius * 0.5, 0);
      ctx.closePath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = colorHex;
      ctx.stroke();

      // Inner Crown Peak Symbol
      ctx.beginPath();
      ctx.moveTo(-circleRadius * 0.25, -circleRadius * 0.1);
      ctx.lineTo(-circleRadius * 0.35, circleRadius * 0.15);
      ctx.lineTo(0, circleRadius * 0.05);
      ctx.lineTo(circleRadius * 0.35, circleRadius * 0.15);
      ctx.lineTo(circleRadius * 0.25, -circleRadius * 0.1);
      ctx.lineTo(0, circleRadius * 0.2);
      ctx.closePath();
      ctx.fillStyle = colorHex;
      ctx.fill();

      ctx.restore();
    } else {
      // 4 Inner Colored Dots (Matching Reference Image 2)
      const dotOffsets = [
        { dx: -circleRadius * 0.4, dy: -circleRadius * 0.4 },
        { dx: circleRadius * 0.4, dy: -circleRadius * 0.4 },
        { dx: -circleRadius * 0.4, dy: circleRadius * 0.4 },
        { dx: circleRadius * 0.4, dy: circleRadius * 0.4 },
      ];

      dotOffsets.forEach((off) => {
        ctx.beginPath();
        ctx.arc(cx + off.dx, cy + off.dy, cellSize * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = colorHex;
        ctx.fill();
      });
    }
  }

  private drawCorridor(corridor: { col: number; row: number }[], colorHex: string) {
    const { ctx, cellSize } = this;
    corridor.forEach((pos) => {
      const x = pos.col * cellSize;
      const y = pos.row * cellSize;
      ctx.fillStyle = colorHex;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellSize, cellSize);
    });
  }

  private drawCenterArrows(innerSize: number, cellSize: number) {
    const { ctx } = this;
    const cx = 7.5 * cellSize;
    const cy = 7.5 * cellSize;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6 * cellSize, 6 * cellSize, 3 * cellSize, 3 * cellSize);

    // Left GREEN Arrow (pointing right)
    ctx.beginPath();
    ctx.moveTo(6 * cellSize, 9 * cellSize);
    ctx.lineTo(6 * cellSize, 6 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = '#16a34a';
    ctx.fill();

    // Top YELLOW Arrow (pointing down)
    ctx.beginPath();
    ctx.moveTo(6 * cellSize, 6 * cellSize);
    ctx.lineTo(9 * cellSize, 6 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = '#eab308';
    ctx.fill();

    // Right BLUE Arrow (pointing left)
    ctx.beginPath();
    ctx.moveTo(9 * cellSize, 6 * cellSize);
    ctx.lineTo(9 * cellSize, 9 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    // Bottom RED Arrow (pointing up)
    ctx.beginPath();
    ctx.moveTo(9 * cellSize, 9 * cellSize);
    ctx.lineTo(6 * cellSize, 9 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(6 * cellSize, 6 * cellSize, 3 * cellSize, 3 * cellSize);
  }

  private drawCurvedTrackArrows(cellSize: number) {
    const { ctx } = this;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;

    // Curved Arrow Top Edge (Entering Yellow Track)
    ctx.beginPath();
    ctx.arc(6.5 * cellSize, 1.5 * cellSize, cellSize * 0.8, Math.PI, Math.PI * 1.8);
    ctx.stroke();

    // Curved Arrow Right Edge (Entering Blue Track)
    ctx.beginPath();
    ctx.arc(13.5 * cellSize, 6.5 * cellSize, cellSize * 0.8, (Math.PI * 3) / 2, Math.PI * 2.3);
    ctx.stroke();

    // Curved Arrow Bottom Edge (Entering Red Track)
    ctx.beginPath();
    ctx.arc(8.5 * cellSize, 13.5 * cellSize, cellSize * 0.8, 0, Math.PI * 0.8);
    ctx.stroke();

    // Curved Arrow Left Edge (Entering Green Track)
    ctx.beginPath();
    ctx.arc(1.5 * cellSize, 8.5 * cellSize, cellSize * 0.8, Math.PI / 2, Math.PI * 1.3);
    ctx.stroke();
  }

  private static luxuryStarImg: HTMLImageElement | null = null;

  private drawLuxuryStar(cx: number, cy: number, size: number) {
    const { ctx } = this;
    if (!BoardCanvasRenderer.luxuryStarImg) {
      BoardCanvasRenderer.luxuryStarImg = new Image();
      BoardCanvasRenderer.luxuryStarImg.src = '/assets/images/icons/luxury_star_icon.png';
    }

    const img = BoardCanvasRenderer.luxuryStarImg;
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
    } else {
      this.drawStar(cx, cy, size * 0.4, '#eab308');
    }
  }

  private drawStar(cx: number, cy: number, radius: number, colorHex: string) {
    const { ctx } = this;
    const spikes = 5;
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * radius;
      y = cy + Math.sin(rot) * radius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * (radius / 2);
      y = cy + Math.sin(rot) * (radius / 2);
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - radius);
    ctx.closePath();
    ctx.fillStyle = colorHex;
    ctx.fill();
  }

  private drawTurnArrow(color: PlayerColor) {
    const { ctx, cellSize } = this;
    const pulseOffset = Math.sin(this.animPulseAngle) * 6;

    const arrowMap: Record<PlayerColor, { x: number; y: number; angle: number; colorHex: string }> = {
      GREEN: { x: 3 * cellSize, y: 0.8 * cellSize + pulseOffset, angle: Math.PI / 2, colorHex: '#16a34a' },
      YELLOW: { x: 12 * cellSize, y: 0.8 * cellSize + pulseOffset, angle: Math.PI / 2, colorHex: '#eab308' },
      BLUE: { x: 12 * cellSize, y: 14.2 * cellSize - pulseOffset, angle: (Math.PI * 3) / 2, colorHex: '#2563eb' },
      RED: { x: 3 * cellSize, y: 14.2 * cellSize - pulseOffset, angle: (Math.PI * 3) / 2, colorHex: '#dc2626' },
    };

    const config = arrowMap[color];
    if (!config) return;

    ctx.save();
    ctx.translate(config.x, config.y);
    ctx.rotate(config.angle);

    ctx.shadowColor = config.colorHex;
    ctx.shadowBlur = 16 + Math.sin(this.animPulseAngle) * 8;

    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(14, 10);
    ctx.lineTo(5, 10);
    ctx.lineTo(5, 26);
    ctx.lineTo(-5, 26);
    ctx.lineTo(-5, 10);
    ctx.lineTo(-14, 10);
    ctx.closePath();

    ctx.fillStyle = config.colorHex;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
  }

  private drawDestinationPath(color: PlayerColor, fromStep: number, toStep: number) {
    const { ctx, cellSize } = this;

    for (let step = fromStep + 1; step <= toStep; step++) {
      const coords = getPixelCoordinates(color, step, 0, cellSize);
      const isDestination = step === toStep;

      ctx.beginPath();
      ctx.arc(coords.x, coords.y, cellSize * (isDestination ? 0.35 : 0.18), 0, Math.PI * 2);

      if (isDestination) {
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.fill();
      }
    }
  }

  private drawAllTokens(
    state: GameState,
    activeHoverTokenId?: string | null,
    selectedTokenId?: string | null
  ) {
    const { ctx, cellSize } = this;
    const colorMap: Record<PlayerColor, string> = {
      GREEN: '#16a34a',
      YELLOW: '#eab308',
      BLUE: '#2563eb',
      RED: '#dc2626',
    };

    const moveableSet = new Set(state.movableTokens.map((m) => m.tokenId));

    state.players.forEach((player) => {
      player.tokens.forEach((token) => {
        const isAnimating = state.animatingToken?.tokenId === token.id;
        const displayStep = isAnimating ? state.animatingToken!.currentStep : token.stepCount;

        const coords = getPixelCoordinates(token.color, displayStep, token.index, cellSize);
        const radius = cellSize * 0.42;

        const isMoveable = moveableSet.has(token.id);
        const isHovered = activeHoverTokenId === token.id;
        const isSelected = selectedTokenId === token.id;

        const scale = isMoveable ? 1.0 + Math.sin(this.animPulseAngle * 2) * 0.1 : 1.0;

        ctx.save();
        ctx.translate(coords.x, coords.y);
        ctx.scale(scale, scale);

        // Ground Drop Shadow
        ctx.beginPath();
        ctx.ellipse(0, cellSize * 0.22, radius * 0.85, radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // 3D Pawn Asset Image
        const pawnImg = this.getPawnImage(token.color);
        if (pawnImg && pawnImg.complete && pawnImg.naturalWidth > 0) {
          const pawnW = cellSize * 0.88;
          const pawnH = pawnW * (pawnImg.naturalHeight / pawnImg.naturalWidth);
          
          if (isMoveable || isSelected) {
            ctx.shadowColor = isSelected ? '#38bdf8' : isHovered ? '#fbbf24' : '#60a5fa';
            ctx.shadowBlur = 12 + Math.sin(this.animPulseAngle * 3) * 6;
          }

          ctx.drawImage(pawnImg, -pawnW / 2, -pawnH * 0.75, pawnW, pawnH);
        } else {
          // Fallback Glossy 2D Token Body with Gold Crown
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fillStyle = colorMap[token.color];
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#ca8a04';
          ctx.stroke();
        }

        // Selection / Movable Glow Ring around base
        if (isMoveable || isSelected) {
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.ellipse(0, cellSize * 0.2, radius * 0.95, radius * 0.4, 0, 0, Math.PI * 2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = isSelected ? '#38bdf8' : isHovered ? '#fbbf24' : '#60a5fa';
          ctx.stroke();
        }

        ctx.restore();
      });
    });
  }
}
