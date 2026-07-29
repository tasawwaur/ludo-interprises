import React from 'react';

interface DiceFaceProps {
  value: number | null;
  size?: number; // Size in pixels
  isRolling?: boolean;
}

export const DiceFace: React.FC<DiceFaceProps> = ({ value, size = 48, isRolling = false }) => {
  const num = value && value >= 1 && value <= 6 ? value : 1;

  // Render Dot Pips (1 to 6)
  const renderPips = (val: number) => {
    const dotColor = val === 6 ? '#ef4444' : '#0f172a'; // Red for 6, dark slate for 1..5

    switch (val) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: dotColor }}></span>
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <span className="w-2.5 h-2.5 rounded-full self-start" style={{ backgroundColor: dotColor }}></span>
            <span className="w-2.5 h-2.5 rounded-full self-end" style={{ backgroundColor: dotColor }}></span>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <span className="w-2.5 h-2.5 rounded-full self-start" style={{ backgroundColor: dotColor }}></span>
            <span className="w-2.5 h-2.5 rounded-full self-center" style={{ backgroundColor: dotColor }}></span>
            <span className="w-2.5 h-2.5 rounded-full self-end" style={{ backgroundColor: dotColor }}></span>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1.5 gap-1.5 items-center justify-items-center">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-1.5">
            <div className="w-full h-full grid grid-cols-2 gap-2 items-center justify-items-center">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
            </div>
            <span
              className="w-2.5 h-2.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner"
              style={{ backgroundColor: dotColor }}
            ></span>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1.5 gap-1 items-center justify-items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative rounded-2xl bg-gradient-to-br from-white via-slate-100 to-slate-200 border-2 border-slate-300 shadow-2xl flex items-center justify-center transition-all duration-300 ${
        isRolling ? 'animate-spin scale-110 border-amber-400' : ''
      }`}
    >
      {renderPips(num)}
    </div>
  );
};
