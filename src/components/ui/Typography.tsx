import React from "react";

export const Title: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h1 className={`text-2xl font-black text-white tracking-tight ${className}`}>{children}</h1>
);

export const Subtitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-sm text-slate-400 font-medium ${className}`}>{children}</p>
);

export const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-black ${className}`}>
    {children}
  </span>
);
