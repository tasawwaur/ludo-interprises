import React from "react"; export const RankingCard: React.FC<{ rank: number; name: string }> = ({ rank, name }) => <div className="p-3 bg-slate-900 rounded-xl">#{rank} {name}</div>;
