import React from "react";

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

export const Flex: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`flex items-center gap-4 ${className}`}>{children}</div>
);

export const Stack: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`flex flex-col gap-4 ${className}`}>{children}</div>
);

export const Grid: React.FC<{ children: React.ReactNode; cols?: number; className?: string }> = ({ children, cols = 3, className = "" }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-4 ${className}`}>{children}</div>
);
