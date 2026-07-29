import React, { useState, useEffect } from 'react';
import { getRemainingTimeLabel } from '../utils/countdown';

interface CountdownTimerProps {
  endTime: string;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, className = '' }) => {
  const [label, setLabel] = useState(() => getRemainingTimeLabel(endTime));

  useEffect(() => {
    const updateTime = () => {
      setLabel(getRemainingTimeLabel(endTime));
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <span className={`text-[10px] font-black text-amber-300 font-mono ${className}`}>
      ⏳ {label}
    </span>
  );
};
export default CountdownTimer;
