import { GameState, PlayerColor, Token } from '../engine/Engine.types';
import {
  OUTER_TRACK_COORDS,
  HOME_CORRIDORS,
  YARD_POSITIONS,
  SAFE_TRACK_INDICES,
  COLOR_START_INDEX,
  getPixelCoordinates,
  getCoordinateColor,
  getQuadrantPlayerColor,
} from '../board/BoardCoordinates';
import { getBoardTheme, getTokenStyle } from '../../utils/cosmeticStyles';

export class BoardCanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private cellSize: number;
  private animPulseAngle = 0;
  private currentTheme!: any;

  // Waterfall particle system per token
  private waterfallParticles: Map<string, Array<{
    x: number; y: number; vy: number; vx: number;
    life: number; maxLife: number; size: number; alpha: number;
  }>> = new Map();

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.cellSize = width / 15;
  }

  public render(
    state: GameState,
    localPlayerColor: PlayerColor | null,
    activeHoverTokenId?: string | null,
    selectedTokenId?: string | null
  ) {
    const { ctx, width, height } = this;
    this.animPulseAngle = (this.animPulseAngle + 0.05) % (Math.PI * 2);
    
    // Load equipped board theme
    const theme = getBoardTheme(state.equippedBoardId || 'board_default');
    this.currentTheme = theme;

    ctx.clearRect(0, 0, width, height);

    // 1. Deep Magenta Beveled Outer Frame (Matching Reference Image 2)
    const framePadding = 14;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 32);
    const outerGradient = ctx.createLinearGradient(0, 0, width, height);
    outerGradient.addColorStop(0, theme.frameOuter);
    outerGradient.addColorStop(0.5, theme.frameInner);
    outerGradient.addColorStop(1, theme.frameOuter);
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
    ctx.fillStyle = theme.boardBg;
    ctx.fillRect(0, 0, innerSize, innerSize);

    // Inner gold beveled board border
    const innerGold = ctx.createLinearGradient(0, 0, innerSize, innerSize);
    innerGold.addColorStop(0, '#fbbf24');
    innerGold.addColorStop(0.5, '#d97706');
    innerGold.addColorStop(1, '#b45309');
    ctx.strokeStyle = innerGold;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, innerSize, innerSize);

    // Dynamic Quadrant Mapped Player Colors (Alignment matching Reference Image 2)
    const redPlayer = getQuadrantPlayerColor('RED', localPlayerColor);
    const greenPlayer = getQuadrantPlayerColor('GREEN', localPlayerColor);
    const yellowPlayer = getQuadrantPlayerColor('YELLOW', localPlayerColor);
    const bluePlayer = getQuadrantPlayerColor('BLUE', localPlayerColor);

    // Top-Left (traditionally RED)
    this.drawReferenceYard(0, 0, 6, 6, redPlayer, false);

    // Top-Right (traditionally GREEN)
    this.drawReferenceYard(9, 0, 6, 6, greenPlayer, true);

    // Bottom-Right (traditionally YELLOW)
    this.drawReferenceYard(9, 9, 6, 6, yellowPlayer, false);

    // Bottom-Left (traditionally BLUE)
    this.drawReferenceYard(0, 9, 6, 6, bluePlayer, false);

    // 3. Outer Track Cells (Subtle Gradient Grid with Grey Borders)
    OUTER_TRACK_COORDS.forEach((pos, idx) => {
      const x = pos.col * innerCellSize;
      const y = pos.row * innerCellSize;

      const cellGrad = ctx.createLinearGradient(x, y, x + innerCellSize, y + innerCellSize);
      cellGrad.addColorStop(0, theme.boardBg === '#fafaf9' ? '#ffffff' : theme.boardBg);
      cellGrad.addColorStop(1, theme.boardBg === '#fafaf9' ? '#f8fafc' : theme.boardBg); // Light slate matching theme
      ctx.fillStyle = cellGrad;
      ctx.fillRect(x, y, innerCellSize, innerCellSize);

      ctx.strokeStyle = theme.gridBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, innerCellSize, innerCellSize);

      // Star Safe Tile (Luxury 3D Golden Royal Star Badge on all 8 safe stops)
      if (SAFE_TRACK_INDICES.has(idx)) {
        this.drawLuxuryStar(x + innerCellSize / 2, y + innerCellSize / 2, innerCellSize * 0.85);
      }
    });

    // 4. Home Corridors (Mapped color order)
    this.drawCorridor(HOME_CORRIDORS.RED, '#dc2626', redPlayer);
    this.drawCorridor(HOME_CORRIDORS.GREEN, '#16a34a', greenPlayer);
    this.drawCorridor(HOME_CORRIDORS.YELLOW, '#eab308', yellowPlayer);
    this.drawCorridor(HOME_CORRIDORS.BLUE, '#2563eb', bluePlayer);

    // 5. Center Arrows (Meeting arrows matching dynamic color order)
    this.drawCenterArrows(innerSize, innerCellSize, redPlayer, greenPlayer, yellowPlayer, bluePlayer);

    // 6. Track Entry Curved Arrows (Matching Reference Image 2)
    this.drawCurvedTrackArrows(innerCellSize);

    // 6. Pulse Active Player Arrow
    if (state.gameStatus !== 'GAME_OVER') {
      this.drawTurnArrow(state.currentTurnColor, localPlayerColor);
    }

    // 7. Destination Path Indicator for hovered/selected token
    const activeTokenId = selectedTokenId || activeHoverTokenId;
    if (activeTokenId && state.gameStatus === 'MOVE_WAIT') {
      const activeToken = state.players
        .flatMap((p) => p.tokens)
        .find((t) => t.id === activeTokenId);
      const targetMove = state.movableTokens.find((m) => m.tokenId === activeTokenId);

      if (activeToken && targetMove) {
        this.drawDestinationPath(activeToken.color, targetMove.fromStep, targetMove.toStep, localPlayerColor);
      }
    }

    // 8. Draw All Tokens
    this.drawAllTokens(state, localPlayerColor, activeHoverTokenId, selectedTokenId);

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
    const theme = this.currentTheme;
    const x = col * cellSize;
    const y = row * cellSize;
    const w = cols * cellSize;
    const h = rows * cellSize;

    // Rich gradient for Yard Box
    const yardGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    let fillGrad: [string, string];
    if (color === 'GREEN') fillGrad = theme.greenFill;
    else if (color === 'YELLOW') fillGrad = theme.yellowFill;
    else if (color === 'BLUE') fillGrad = theme.blueFill;
    else fillGrad = theme.redFill;

    yardGrad.addColorStop(0, fillGrad[0]);
    yardGrad.addColorStop(0.5, fillGrad[1]);
    yardGrad.addColorStop(1, '#020617'); // Dark tint

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
        GREEN: theme.greenFill[1],
        YELLOW: theme.yellowFill[1],
        BLUE: theme.blueFill[1],
        RED: theme.redFill[1],
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
    const theme = this.currentTheme;
    
    // Choose premium gradients for corridor cells
    const gradMap: Record<PlayerColor, [string, string]> = {
      GREEN: theme.greenFill,
      YELLOW: theme.yellowFill,
      BLUE: theme.blueFill,
      RED: theme.redFill,
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

  private drawCenterArrows(
    innerSize: number,
    cellSize: number,
    redPlayer: PlayerColor,
    greenPlayer: PlayerColor,
    yellowPlayer: PlayerColor,
    bluePlayer: PlayerColor
  ) {
    const { ctx } = this;
    const theme = this.currentTheme;
    const cx = 7.5 * cellSize;
    const cy = 7.5 * cellSize;

    ctx.fillStyle = theme.boardBg;
    ctx.fillRect(6 * cellSize, 6 * cellSize, 3 * cellSize, 3 * cellSize);

    const gradMap: Record<PlayerColor, [string, string]> = {
      GREEN: theme.greenFill,
      YELLOW: theme.yellowFill,
      BLUE: theme.blueFill,
      RED: theme.redFill,
    };

    // Left RED Arrow (pointing right)
    const redColors = gradMap[redPlayer];
    const redGrad = ctx.createLinearGradient(6 * cellSize, 7.5 * cellSize, cx, cy);
    redGrad.addColorStop(0, redColors[0]);
    redGrad.addColorStop(1, redColors[1]);
    ctx.beginPath();
    ctx.moveTo(6 * cellSize, 9 * cellSize);
    ctx.lineTo(6 * cellSize, 6 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = redGrad;
    ctx.fill();

    // Top GREEN Arrow (pointing down)
    const greenColors = gradMap[greenPlayer];
    const greenGrad = ctx.createLinearGradient(7.5 * cellSize, 6 * cellSize, cx, cy);
    greenGrad.addColorStop(0, greenColors[0]);
    greenGrad.addColorStop(1, greenColors[1]);
    ctx.beginPath();
    ctx.moveTo(6 * cellSize, 6 * cellSize);
    ctx.lineTo(9 * cellSize, 6 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = greenGrad;
    ctx.fill();

    // Right YELLOW Arrow (pointing left)
    const yellowColors = gradMap[yellowPlayer];
    const yellowGrad = ctx.createLinearGradient(9 * cellSize, 7.5 * cellSize, cx, cy);
    yellowGrad.addColorStop(0, yellowColors[0]);
    yellowGrad.addColorStop(1, yellowColors[1]);
    ctx.beginPath();
    ctx.moveTo(9 * cellSize, 6 * cellSize);
    ctx.lineTo(9 * cellSize, 9 * cellSize);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = yellowGrad;
    ctx.fill();

    // Bottom BLUE Arrow (pointing up)
    const blueColors = gradMap[bluePlayer];
    const blueGrad = ctx.createLinearGradient(7.5 * cellSize, 9 * cellSize, cx, cy);
    blueGrad.addColorStop(0, blueColors[0]);
    blueGrad.addColorStop(1, blueColors[1]);
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

  private drawTurnArrow(color: PlayerColor, localPlayerColor: PlayerColor | null) {
    const { ctx, cellSize } = this;
    const pulseOffset = Math.sin(this.animPulseAngle) * 6;

    const coordColor = getCoordinateColor(color, localPlayerColor);

    // Arrow configurations shifted to match seating order: RED (TL), GREEN (TR), YELLOW (BR), BLUE (BL)
    const arrowMap: Record<PlayerColor, { x: number; y: number; angle: number; colorHex: string }> = {
      RED: { x: 3 * cellSize, y: 0.8 * cellSize + pulseOffset, angle: Math.PI / 2, colorHex: '#dc2626' },
      GREEN: { x: 12 * cellSize, y: 0.8 * cellSize + pulseOffset, angle: Math.PI / 2, colorHex: '#16a34a' },
      YELLOW: { x: 12 * cellSize, y: 14.2 * cellSize - pulseOffset, angle: (Math.PI * 3) / 2, colorHex: '#eab308' },
      BLUE: { x: 3 * cellSize, y: 14.2 * cellSize - pulseOffset, angle: (Math.PI * 3) / 2, colorHex: '#2563eb' },
    };

    const colorHexMap: Record<PlayerColor, string> = {
      RED: '#dc2626',
      GREEN: '#16a34a',
      YELLOW: '#eab308',
      BLUE: '#2563eb',
    };

    const config = arrowMap[coordColor];
    if (!config) return;

    ctx.save();
    ctx.translate(config.x, config.y);
    ctx.rotate(config.angle);

    const arrowColor = colorHexMap[color];
    ctx.shadowColor = arrowColor;
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

    ctx.fillStyle = arrowColor;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
  }

  private drawDestinationPath(color: PlayerColor, fromStep: number, toStep: number, localPlayerColor: PlayerColor | null) {
    const { ctx, cellSize } = this;
 
    for (let step = fromStep + 1; step <= toStep; step++) {
      const coords = getPixelCoordinates(color, step, 0, cellSize, localPlayerColor);
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
    localPlayerColor: PlayerColor | null,
    activeHoverTokenId?: string | null,
    selectedTokenId?: string | null
  ) {
    const { ctx, cellSize } = this;

    // Vibrant token color palettes
    const tokenPalette: Record<PlayerColor, { top: string; mid: string; bot: string; glow: string; ring: string }> = {
      RED:    { top: '#ff6b6b', mid: '#e53935', bot: '#b71c1c', glow: '#ff1744', ring: '#ff8a80' },
      GREEN:  { top: '#69f0ae', mid: '#00c853', bot: '#1b5e20', glow: '#00e676', ring: '#b9f6ca' },
      YELLOW: { top: '#fff176', mid: '#ffd600', bot: '#f57f17', glow: '#ffea00', ring: '#ffff8d' },
      BLUE:   { top: '#82b1ff', mid: '#2979ff', bot: '#0d47a1', glow: '#448aff', ring: '#bbdefb' },
    };

    const moveableSet = new Set(state.movableTokens.map((m) => m.tokenId));

    state.players.forEach((player) => {
      player.tokens.forEach((token) => {
        const isAnimating = state.animatingToken?.tokenId === token.id;
        let coords: { x: number; y: number };

        if (isAnimating && state.animatingToken) {
          const now = performance.now();
          const stepDuration = 160;
          const elapsed = now - (state.animatingToken.stepStartTime || now);
          const p = Math.min(1.0, Math.max(0.0, elapsed / stepDuration));
          // Smooth cubic ease-in-out curve
          const ease = p * p * (3 - 2 * p);

          const prevStep = state.animatingToken.prevStep ?? Math.max(-1, state.animatingToken.currentStep - 1);
          const prevCoords = getPixelCoordinates(token.color, prevStep, token.index, cellSize, localPlayerColor);
          const targetCoords = getPixelCoordinates(token.color, state.animatingToken.currentStep, token.index, cellSize, localPlayerColor);

          // Smooth lerp + gentle 3D arc hop on step
          const interpX = prevCoords.x + (targetCoords.x - prevCoords.x) * ease;
          const hopArc = -Math.sin(p * Math.PI) * (cellSize * 0.28);
          const interpY = prevCoords.y + (targetCoords.y - prevCoords.y) * ease + hopArc;

          coords = { x: interpX, y: interpY };
        } else {
          coords = getPixelCoordinates(token.color, token.stepCount, token.index, cellSize, localPlayerColor);
        }
        const radius = cellSize * 0.40;

        const isMoveable = moveableSet.has(token.id);
        const isHovered = activeHoverTokenId === token.id;
        const isSelected = selectedTokenId === token.id;
        const pal = tokenPalette[token.color];

        // Pulse scale for moveable tokens
        const pulse = isMoveable ? 1.0 + Math.sin(this.animPulseAngle * 2.5) * 0.12 : 1.0;

        ctx.save();
        ctx.translate(coords.x, coords.y);
        ctx.scale(pulse, pulse);

        // ── 1. Outer glow for moveable/selected ──────────────────────────────
        if (isMoveable || isSelected) {
          ctx.shadowColor = isSelected ? '#38bdf8' : pal.glow;
          ctx.shadowBlur = 18 + Math.sin(this.animPulseAngle * 3) * 8;
        }

        // ── 2. Ground shadow ellipse ─────────────────────────────────────────
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.6, radius * 0.75, radius * 0.22, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 0;
        ctx.fill();

        // ── 3. Token base oval (3D illusion base) ────────────────────────────
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.35, radius * 0.82, radius * 0.22, 0, 0, Math.PI * 2);
        const baseGrad = ctx.createLinearGradient(-radius, 0, radius, 0);
        baseGrad.addColorStop(0, pal.bot);
        baseGrad.addColorStop(0.5, pal.mid);
        baseGrad.addColorStop(1, pal.bot);
        ctx.fillStyle = baseGrad;
        ctx.fill();

        // ── 4. Main sphere body ──────────────────────────────────────────────
        const sphereGrad = ctx.createRadialGradient(
          -radius * 0.25, -radius * 0.3, radius * 0.05,
          0, 0, radius
        );
        sphereGrad.addColorStop(0, '#ffffff');
        sphereGrad.addColorStop(0.15, pal.top);
        sphereGrad.addColorStop(0.55, pal.mid);
        sphereGrad.addColorStop(1, pal.bot);

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        if (isMoveable || isSelected) {
          ctx.shadowColor = isSelected ? '#38bdf8' : pal.glow;
          ctx.shadowBlur = 18 + Math.sin(this.animPulseAngle * 3) * 8;
        }
        ctx.fillStyle = sphereGrad;
        ctx.fill();

        // ── 5. Gold ring border ───────────────────────────────────────────────
        ctx.shadowBlur = 0;
        const ringGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
        ringGrad.addColorStop(0, '#fef9c3');
        ringGrad.addColorStop(0.4, '#fbbf24');
        ringGrad.addColorStop(1, '#92400e');
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = ringGrad;
        ctx.stroke();

        // ── 6. Inner shine highlight ──────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(-radius * 0.28, -radius * 0.28, radius * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fill();

        // ── 7. Number badge (player index) ────────────────────────────────────
        const playerIdx = state.players.findIndex((p) => p.color === player.color);
        const displayNum = token.index + 1 + playerIdx * player.tokens.length;
        const badgeR = radius * 0.38;

        ctx.beginPath();
        ctx.arc(radius * 0.42, -radius * 0.42, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();

        ctx.font = `bold ${Math.round(badgeR * 1.1)}px sans-serif`;
        ctx.fillStyle = '#fef9c3';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(displayNum), radius * 0.42, -radius * 0.42);

        // ── 8. Moveable ring pulse ────────────────────────────────────────────
        if (isMoveable || isSelected) {
          ctx.beginPath();
          ctx.arc(0, 0, radius + 4 + Math.sin(this.animPulseAngle * 2) * 3, 0, Math.PI * 2);
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = isSelected ? '#38bdf8' : pal.ring;
          ctx.shadowColor = isSelected ? '#38bdf8' : pal.glow;
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        ctx.restore();

        // ── 9. Waterfall droplets (Permanent on all tokens) ───────────────────
        this.updateWaterfallParticles(token.id, coords.x, coords.y, radius, pal);
        this.drawWaterfallParticles(token.id, pal);
      });
    });
  }

  private updateWaterfallParticles(
    tokenId: string,
    cx: number,
    cy: number,
    radius: number,
    pal: { top: string; mid: string; bot: string; glow: string; ring: string }
  ) {
    if (!this.waterfallParticles.has(tokenId)) {
      this.waterfallParticles.set(tokenId, []);
    }
    const particles = this.waterfallParticles.get(tokenId)!;

    // Spawn 2-3 new droplets per frame from token rim
    const spawnCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < spawnCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spawnRadius = radius * (0.5 + Math.random() * 0.5);
      particles.push({
        x: cx + Math.cos(angle) * spawnRadius,
        y: cy + Math.sin(angle) * spawnRadius * 0.4 - radius * 0.2,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.4 + Math.random() * 1.4,
        life: 0,
        maxLife: 22 + Math.floor(Math.random() * 18),
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.85 + Math.random() * 0.15,
      });
    }

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.vx *= 0.96; // drag
      p.life++;
      p.alpha = (1 - p.life / p.maxLife) * 0.9;
      if (p.life >= p.maxLife) particles.splice(i, 1);
    }
  }

  private drawWaterfallParticles(
    tokenId: string,
    pal: { top: string; mid: string; bot: string; glow: string; ring: string }
  ) {
    const { ctx } = this;
    const particles = this.waterfallParticles.get(tokenId);
    if (!particles) return;

    particles.forEach((p) => {
      const t = p.life / p.maxLife;
      // Interpolate color from ring (top) to bot (fading)
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = pal.glow;
      ctx.shadowBlur = 4;

      // Draw teardrop-shaped droplet
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);

      const dropGrad = ctx.createRadialGradient(p.x - p.size * 0.2, p.y - p.size * 0.2, 0, p.x, p.y, p.size);
      dropGrad.addColorStop(0, '#ffffff');
      dropGrad.addColorStop(0.4, pal.top);
      dropGrad.addColorStop(1, pal.mid);
      ctx.fillStyle = dropGrad;
      ctx.fill();

      ctx.restore();
    });
  }

  private drawPremiumTokenCanvas(
    ctx: CanvasRenderingContext2D,
    cellSize: number,
    style: any
  ) {
    const radius = cellSize * 0.42;

    // Apply glowing effect for Neon / Glow styles
    if (style.isNeon) {
      ctx.shadowColor = style.glowColor;
      ctx.shadowBlur = 12 + Math.sin(this.animPulseAngle * 3) * 6;
    }

    // Dynamic gradient
    const grad = ctx.createRadialGradient(
      -radius * 0.3,
      -radius * 0.3,
      2,
      0,
      0,
      radius
    );

    if (style.isGlass) {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.4, `${style.primaryColor}aa`);
      grad.addColorStop(1, `${style.secondaryColor}44`);
    } else if (style.isMetallic) {
      const linGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      linGrad.addColorStop(0, '#ffffff');
      linGrad.addColorStop(0.3, style.primaryColor);
      linGrad.addColorStop(0.7, style.secondaryColor);
      linGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = linGrad;
    } else if (style.isMarble) {
      grad.addColorStop(0, style.primaryColor);
      grad.addColorStop(0.3, '#cbd5e1');
      grad.addColorStop(0.7, style.secondaryColor);
      grad.addColorStop(1, '#334155');
    } else {
      // Glossy / Shiny
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, style.primaryColor);
      grad.addColorStop(1, style.secondaryColor);
    }

    if (!style.isMetallic) {
      ctx.fillStyle = grad;
    }

    // Draw pawn shape paths on canvas:
    // Base oval
    ctx.beginPath();
    ctx.ellipse(0, cellSize * 0.22, radius * 0.9, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body flare
    ctx.beginPath();
    ctx.moveTo(-radius * 0.6, cellSize * 0.2);
    ctx.quadraticCurveTo(-radius * 0.4, -radius * 0.2, -radius * 0.35, -radius * 0.6);
    ctx.lineTo(radius * 0.35, -radius * 0.6);
    ctx.quadraticCurveTo(radius * 0.4, -radius * 0.2, radius * 0.6, cellSize * 0.2);
    ctx.closePath();
    ctx.fill();

    // Collar
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.6, radius * 0.5, radius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head ball
    ctx.beginPath();
    ctx.arc(0, -radius * 1.1, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // High brightness glossy reflection spots (white overlay shine)
    ctx.shadowBlur = 0; // reset shadow for gloss
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(-radius * 0.2, -radius * 1.3, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}
