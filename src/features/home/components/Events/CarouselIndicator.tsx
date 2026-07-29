import React from 'react';

interface CarouselIndicatorProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}

export const CarouselIndicator: React.FC<CarouselIndicatorProps> = ({
  total,
  current,
  onSelect,
}) => {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`h-2 rounded-full transition-all cursor-pointer ${
            current === i
              ? 'w-6 bg-[#ffd54f] shadow-[0_0_10px_rgba(255,213,79,0.8)]'
              : 'w-2 bg-slate-600/70 hover:bg-slate-400'
          }`}
        />
      ))}
    </div>
  );
};
