import React from 'react';

interface AdContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const AdContainer: React.FC<AdContainerProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`relative bg-[#1A0C2A] border border-purple-900/30 rounded-2xl p-3 shadow-inner ${className}`}>
      {title && (
        <span className="text-[8px] font-black text-purple-300 uppercase tracking-widest block mb-2 px-1">
          {title}
        </span>
      )}
      {children}
    </div>
  );
};
export default AdContainer;
