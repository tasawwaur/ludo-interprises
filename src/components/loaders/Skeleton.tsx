import React from "react"; export const Skeleton: React.FC<{ className?: string }> = ({ className="" }) => <div className={`animate-pulse bg-slate-800 rounded-xl ${className}`}></div>;
