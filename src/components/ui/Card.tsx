import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "glass" | "gradient" | "amoled";
}

export const Card: React.FC<CardProps> = ({ children, variant = "solid", className = "", ...props }) => {
  const variants = {
    solid: "bg-slate-900 border border-slate-800",
    glass: "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl",
    gradient: "bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-indigo-500/20",
    amoled: "bg-slate-950 border border-slate-900 shadow-black shadow-2xl"
  };

  return (
    <div className={`p-5 rounded-3xl transition-all duration-300 ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
