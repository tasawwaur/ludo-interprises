import React from "react"; export const AchievementBadge: React.FC<{ title: string }> = ({ title }) => <div className="p-2 bg-slate-800 rounded-xl text-center text-xs font-bold">🏆 {title}</div>;
