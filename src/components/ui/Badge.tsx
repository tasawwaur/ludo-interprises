import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "indigo" | "emerald" | "amber" | "rose" | "cyan";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "indigo", className = "" }) => {
  const variants = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
