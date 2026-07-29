import React from 'react';
import { Particles } from './Particles';
import { Glow } from './Glow';
import { Noise } from './Noise';

export const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Primary & Secondary Backdrop (#12061F -> #2A0B34 -> #5B174D) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#12061f] via-[#2a0b34] to-[#5b174d]"></div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)]"></div>

      {/* Radial Center Glow */}
      <Glow />

      {/* Floating Particles */}
      <Particles />

      {/* Noise Texture */}
      <Noise />
    </div>
  );
};
