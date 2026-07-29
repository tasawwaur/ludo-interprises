import React from 'react';

interface XPCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const XPCard: React.FC<XPCardProps> = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`relative bg-purple-950/60 border-2 border-purple-500/30 rounded-3xl p-5 shadow-2xl overflow-hidden backdrop-blur-md ${className}`}>
      {/* Golden accent bar at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px]"></div>
      
      {/* Title & Subtitle */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-sm font-black text-amber-200 uppercase tracking-widest">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-[10px] text-purple-300 italic mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
export default XPCard;
