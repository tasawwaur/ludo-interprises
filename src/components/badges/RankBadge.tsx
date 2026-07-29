import React from "react"; export const RankBadge: React.FC<{ rank: number }> = ({ rank }) => <span className="px-2 py-0.5 text-xs font-black bg-amber-500 text-black rounded-full">#{rank}</span>;
