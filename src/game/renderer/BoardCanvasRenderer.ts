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

    // White Board Canvas (Subtle off-white marble look)
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, innerSize, innerSize);

    // Inner gold beveled board border
    const innerGold = ctx.createLinearGradient(0, 0, innerSize, innerSize);
    innerGold.addColorStop(0, '#fbbf24');
    innerGold.addColorStop(0.5, '#d97706');
    innerGold.addColorStop(1, '#b45309');
    ctx.strokeStyle = innerGold;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, innerSize, innerSize);

    // 2. Corner Color Yards (EXACT MATCH to Reference Image 2 and BoardCoordinates.ts)
    // Top-Left RED Yard (Red Background + White Circle + Red Dots)
    this.drawReferenceYard(0, 0, 6, 6, 'RED', false);

    // Top-Right GREEN Yard (Green Background + White Circle + Green Diamond Crown)
    this.drawReferenceYard(9, 0, 6, 6, 'GREEN', true);

    // Bottom-Right YELLOW Yard (Yellow Background + White Circle + Yellow Dots)
    this.drawReferenceYard(9, 9, 6, 6, 'YELLOW', false);

    // Bottom-Left BLUE Yard (Blue Background + White Circle + Blue Dots)
    this.drawReferenceYard(0, 9, 6, 6, 'BLUE', false);

    // 3. Outer Track Cells (Subtle Gradient Grid with Grey Borders)
    OUTER_TRACK_COORDS.forEach((pos, idx) => {
      const x = pos.col * innerCellSize;
      const y = pos.row * innerCellSize;

      const cellGrad = ctx.createLinearGradient(x, y, x + innerCellSize, y + innerCellSize);
      cellGrad.addColorStop(0, '#ffffff');
      cellGrad.addColorStop(1, '#f8fafc'); // Light slate
      ctx.fillStyle = cellGrad;
      ctx.fillRect(x, y, innerCellSize, innerCellSize);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, innerCellSize, innerCellSize);

      // Star Safe Tile (Luxury 3D Golden Royal Star Badge on all 8 safe stops)
      if (SAFE_TRACK_INDICES.has(idx)) {
        this.drawLuxuryStar(x + innerCellSize / 2, y + innerCellSize / 2, innerCellSize * 0.85);
      }
    });

    // 4. Home Corridors (Red left, Green top, Yellow right, Blue bottom)
    this.drawCorridor(HOME_CORRIDORS.RED, '#dc2626', 'RED');
    this.drawCorridor(HOME_CORRIDORS.GREEN, '#16a34a', 'GREEN');
    this.drawCorridor(HOME_CORRIDORS.YELLOW, '#eab308', 'YELLOW');
    this.drawCorridor(HOME_CORRIDORS.BLUE, '#2563eb', 'BLUE');

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
    color: PlayerColor,
    hasDiamondCrown: boolean
  ) {
    const { ctx, cellSize } = this;
    const x = col * cellSize;
    const y = row * cellSize;
    const w = cols * cellSize;
    const h = rows * cellSize;

    // Rich gradient for Yard Box
    const yardGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    if (color === 'GREEN') {
      yardGrad.addColorStop(0, '#064e3b'); // Dark Emerald
      yardGrad.addColorStop(0.5, '#047857'); // Medium Emerald
      yardGrad.addColorStop(1, '#022c22'); // Deep Emerald
    } else if (color === 'YELLOW') {
      yardGrad.addColorStop(0, '#78350f'); // Dark Amber
      yardGrad.addColorStop(0.5, '#d97706'); // Medium Amber
      yardGrad.addColorStop(1, '#451a03'); // Deep Amber
    } else if (color === 'BLUE') {
      yardGrad.addColorStop(0, '#1e3a8a'); // Dark Royal Blue
      yardGrad.addColorStop(0.5, '#1d4ed8'); // Medium Blue
      yardGrad.addColorStop(1, '#172554'); // Deep Blue
    } else { // RED
      yardGrad.addColorStop(0, '#881337'); // Dark Crimson
      yardGrad.addColorStop(0.5, '#be123c'); // Medium Crimson
      yardGrad.addColorStop(1, '#4c0519'); // Deep Crimson
    }

    ctx.fillStyle = yardGrad;
    ctx.fillRect(x, y, w, h);

    // Golden Royal Border Frame around Yard Box
    const goldGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#fbbf24');
    goldGrad.addColorStop(1, '#b45309');
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 4;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

    // Center Large White Circle
    const cx = x + w / 2;
    const cy = y + h / 2;
    const circleRadius = cellSize * 2.1;

    // Radial silver/cream gradient for inner circle
    const circleGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, circleRadius);
    circleGrad.addColorStop(0, '#ffffff');
    circleGrad.addColorStop(0.8, '#f1f5f9');
    circleGrad.addColorStop(1, '#cbd5e1');

    ctx.beginPath();
    ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = circleGrad;
    ctx.fill();

    // Golden border around the inner white circle
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = goldGrad;
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
      ctx.strokeStyle = '#047857';
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
      ctx.fillStyle = '#047857';
      ctx.fill();

      ctx.restore();
    } else {
      // 4 Inner Colored Dots with golden bezels
      const dotOffsets = [
        { dx: -circleRadius * 0.4, dy: -circleRadius * 0.4 },
        { dx: circleRadius * 0.4, dy: -circleRadius * 0.4 },
        { dx: -circleRadius * 0.4, dy: circleRadius * 0.4 },
        { dx: circleRadius * 0.4, dy: circleRadius * 0.4 },
      ];

      const dotColorMap: Record<PlayerColor, string> = {
        GREEN: '#047857',
        YELLOW: '#d97706',
        BLUE: '#1d4ed8',
        RED: '#be123c',
      };

      dotOffsets.forEach((off) => {
        const dcx = cx + off.dx;
        const dcy = cy + off.dy;
        const radius = cellSize * 0.45;

        // Draw gold outer ring for the dot
        ctx.beginPath();
        ctx.arc(dcx, dcy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = goldGrad;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw radial colored gradient inside the dot
        const dotGrad = ctx.createRadialGradient(dcx, dcy, 0, dcx, dcy, radius);
        dotGrad.addColorStop(0, '#ffffff');
        dotGrad.addColorStop(0.3, dotColorMap[color]);
        dotGrad.addColorStop(1, '#020617'); // Deep dark edge

        ctx.beginPath();
        ctx.arc(dcx, dcy, radius - 1, 0, Math.PI * 2);
        ctx.fillStyle = dotGrad;
        ctx.fill();
      });
    }
  }

  private drawCorridor(corridor: { col: number; row: number }[], colorHex: string, color: PlayerColor) {
    const { ctx, cellSize } = this;
    
    // Choose premium gradients for corridor cells
    const gradMap: Record<PlayerColor, [string, string]> = {
      GREEN: ['#10b981', '#064e3b'],
      YELLOW: ['#fbbf24', '#78350f'],
      BLUE: ['#3b82f6', '#1e3a8a'],
      RED: ['#f43f5e', '#881337'],
    };

    const colors = gradMap[color] || [colorHex, '#000000'];

    corridor.forEach((pos) => {
      const x = pos.col * cellSize;
      const y = pos.row * cellSize;

      const cellGrad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
      cellGrad.addColorStop(0, colors[0]);
      cellGrad.addColorStop(1, colors[1]);

      ctx.fillStyle = cellGrad;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

      // Gold borders separating home corridor cells
      const goldGrad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
      goldGrad.addColorStop(0, '#fde047');
      goldGrad.addColorStop(1, '#ca8a04');
      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, cellSize, cellSize);
    });
  }

  private drawCenterArrows(innerSize: number, cellSize: number) {
    const { ctx } = this;
    const cx = 7.5 * cellSize;
    const cy = 7.5 * cellSize;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6 * cellSize, 6 * cellSize, 3 * cellSize, 3 * cellSize);

    // Left RED Arrow (pointing right)
    const redGrad = ctx.createLinearGradient(6 * cellSize, 7.5 * cellSize, cx, cy);
    redGrad.addColorStop(0, '#881337');
    redGrad.addColorStop(1, '#f43f5e');
    ctx.beginPath();
    ctx.moveTo(6 * cellSize, 9 * cellSize);
    ctx.lineTo(6 * cellSize, 6 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = redGrad;
    ctx.fill();

    // Top GREEN Arrow (pointing down)
    const greenGrad = ctx.createLinearGradient(7.5 * cellSize, 6 * cellSize, cx, cy);
    greenGrad.addColorStop(0, '#064e3b');
    greenGrad.addColorStop(1, '#10b981');
    ctx.beginPath();
    ctx.moveTo(6 * cellSize, 6 * cellSize);
    ctx.lineTo(9 * cellSize, 6 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = greenGrad;
    ctx.fill();

    // Right YELLOW Arrow (pointing left)
    const yellowGrad = ctx.createLinearGradient(9 * cellSize, 7.5 * cellSize, cx, cy);
    yellowGrad.addColorStop(0, '#78350f');
    yellowGrad.addColorStop(1, '#fbbf24');
    ctx.beginPath();
    ctx.moveTo(9 * cellSize, 6 * cellSize);
    ctx.lineTo(9 * cellSize, 9 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = yellowGrad;
    ctx.fill();

    // Bottom BLUE Arrow (pointing up)
    const blueGrad = ctx.createLinearGradient(7.5 * cellSize, 9 * cellSize, cx, cy);
    blueGrad.addColorStop(0, '#1e3a8a');
    blueGrad.addColorStop(1, '#3b82f6');
    ctx.beginPath();
    ctx.moveTo(9 * cellSize, 9 * cellSize);
    ctx.lineTo(6 * cellSize, 9 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = blueGrad;
    ctx.fill();

    // Center Gold Board Separator Frame
    const goldGrad = ctx.createLinearGradient(6 * cellSize, 6 * cellSize, 9 * cellSize, 9 * cellSize);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#fbbf24');
    goldGrad.addColorStop(1, '#b45309');
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 3;
    ctx.strokeRect(6 * cellSize, 6 * cellSize, 3 * cellSize, 3 * cellSize);

    // Royal Golden Medallion in the absolute center
    const medRadius = cellSize * 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, medRadius, 0, Math.PI * 2);
    const medRadGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, medRadius);
    medRadGrad.addColorStop(0, '#fef08a');
    medRadGrad.addColorStop(0.6, '#fbbf24');
    medRadGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = medRadGrad;
    ctx.fill();

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner gold ring
    ctx.beginPath();
    ctx.arc(cx, cy, medRadius * 0.72, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw central royal star inside the medallion
    this.drawStar(cx, cy, medRadius * 0.35, '#ffffff');
  }

  private drawCurvedTrackArrows(cellSize: number) {
    const { ctx } = this;
    
    // Gold/Bronze colored curved entry paths
    const goldGrad = ctx.createLinearGradient(0, 0, 15 * cellSize, 15 * cellSize);
    goldGrad.addColorStop(0, '#fbbf24');
    goldGrad.addColorStop(0.5, '#d97706');
    goldGrad.addColorStop(1, '#ca8a04');
    
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2.5;

    // Curved Arrow Top Edge (Entering Green Track)
    ctx.beginPath();
    ctx.arc(6.5 * cellSize, 1.5 * cellSize, cellSize * 0.8, Math.PI, Math.PI * 1.8);
    ctx.stroke();

    // Curved Arrow Right Edge (Entering Yellow Track)
    ctx.beginPath();
    ctx.arc(13.5 * cellSize, 6.5 * cellSize, cellSize * 0.8, (Math.PI * 3) / 2, Math.PI * 2.3);
    ctx.stroke();

    // Curved Arrow Bottom Edge (Entering Blue Track)
    ctx.beginPath();
    ctx.arc(8.5 * cellSize, 13.5 * cellSize, cellSize * 0.8, 0, Math.PI * 0.8);
    ctx.stroke();

    // Curved Arrow Left Edge (Entering Red Track)
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
      this.drawStar(cx, cy, size * 0.4, '#fbbf24');
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

    // Arrow configurations shifted to match seating order: RED (TL), GREEN (TR), YELLOW (BR), BLUE (BL)
    const arrowMap: Record<PlayerColor, { x: number; y: number; angle: number; colorHex: string }> = {
      RED: { x: 3 * cellSize, y: 0.8 * cellSize + pulseOffset, angle: Math.PI / 2, colorHex: '#dc2626' },
      GREEN: { x: 12 * cellSize, y: 0.8 * cellSize + pulseOffset, angle: Math.PI / 2, colorHex: '#16a34a' },
      YELLOW: { x: 12 * cellSize, y: 14.2 * cellSize - pulseOffset, angle: (Math.PI * 3) / 2, colorHex: '#eab308' },
      BLUE: { x: 3 * cellSize, y: 14.2 * cellSize - pulseOffset, angle: (Math.PI * 3) / 2, colorHex: '#2563eb' },
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
