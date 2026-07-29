import React, { useEffect, useState } from 'react';

interface XPAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export const XPAnimation: React.FC<XPAnimationProps> = ({ amount, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center justify-center animate-bounce">
      <span className="text-xl font-black text-amber-300 font-mono tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] scale-110">
        +{amount} XP!
      </span>
    </div>
  );
};
export default XPAnimation;
