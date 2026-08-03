import React from 'react';
import { getTokenStyle } from '../../utils/cosmeticStyles';

interface PremiumTokenSvgProps {
  tokenId: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PremiumTokenSvg: React.FC<PremiumTokenSvgProps> = ({
  tokenId,
  size = 40,
  className = '',
  style = {}
}) => {
  const styleInfo = getTokenStyle(tokenId);
  const gradId = `pawn-grad-${tokenId.replace(/[^\w-]/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className={className}
      style={{
        filter: styleInfo.isNeon
          ? `drop-shadow(0 0 6px ${styleInfo.glowColor})`
          : `drop-shadow(0 4px 5px rgba(0,0,0,0.4))`,
        ...style
      }}
    >
      <defs>
        {/* Dynamic Gradient for Pawn Body */}
        {styleInfo.isMetallic ? (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor={styleInfo.primaryColor} />
            <stop offset="70%" stopColor={styleInfo.secondaryColor} />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        ) : styleInfo.isGlass ? (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="40%" stopColor={`${styleInfo.primaryColor}99`} />
            <stop offset="100%" stopColor={`${styleInfo.secondaryColor}55`} />
          </linearGradient>
        ) : styleInfo.isMarble ? (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={styleInfo.primaryColor} />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor={styleInfo.secondaryColor} />
            <stop offset="75%" stopColor="#475569" />
            <stop offset="100%" stopColor={styleInfo.primaryColor} />
          </linearGradient>
        ) : (
          <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.7} />
            <stop offset="25%" stopColor={styleInfo.primaryColor} />
            <stop offset="100%" stopColor={styleInfo.secondaryColor} />
          </radialGradient>
        )}

        {/* Gloss highlight overlay gradient */}
        <linearGradient id="gloss-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
        </linearGradient>
      </defs>

      {/* Ground shadow inside SVG */}
      <ellipse cx="25" cy="44" rx="16" ry="4" fill="rgba(0,0,0,0.3)" />

      {/* Pawn Base */}
      <path
        d="M 9,42 C 9,42 12,39 25,39 C 38,39 41,42 41,42 C 41,42 41,45 25,45 C 9,45 9,42 9,42 Z"
        fill={`url(#${gradId})`}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.5"
      />
      
      {/* Lower Ring */}
      <path
        d="M 12,39 Q 25,41 38,39 C 38,37 25,36 12,36 Z"
        fill={`url(#${gradId})`}
        filter="brightness(0.95)"
      />

      {/* Body flare */}
      <path
        d="M 15,36 C 15,31 20,24 20,20 L 30,20 C 30,24 35,31 35,36 Z"
        fill={`url(#${gradId})`}
      />

      {/* Collar Ring */}
      <ellipse cx="25" cy="20" rx="7" ry="2" fill={`url(#${gradId})`} filter="brightness(1.1)" />

      {/* Head ball */}
      <circle cx="25" cy="13" r="8.5" fill={`url(#${gradId})`} />

      {/* 3D Gloss Highlight Overlays */}
      <path
        d="M 21.5,8 A 6,6 0 0 1 28.5,8 A 8,8 0 0 0 21.5,8"
        fill="url(#gloss-grad)"
        opacity="0.65"
      />
      <path
        d="M 21.5,21 C 21.5,21 23,20.2 25,20.2 C 27,20.2 28.5,21 28.5,21 C 28.5,21 27,20.5 25,20.5 C 23,20.5 21.5,21 21.5,21 Z"
        fill="#ffffff"
        opacity="0.8"
      />
    </svg>
  );
};
export default PremiumTokenSvg;
