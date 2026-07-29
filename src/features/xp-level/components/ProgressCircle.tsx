import React from 'react';

interface ProgressCircleProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  className?: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percent,
  size = 120,
  strokeWidth = 10,
  children,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          className="text-purple-950/70"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Glowing Progress Circle */}
        <circle
          className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] transition-all duration-700 ease-out"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Inner Children Container */}
      <div className="relative z-10 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};
export default ProgressCircle;
