import React from "react";

export const Loader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center p-8 gap-3">
    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs font-semibold text-indigo-400 animate-pulse">{text}</span>
  </div>
);
