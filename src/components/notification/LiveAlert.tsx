import React from "react"; export const LiveAlert: React.FC<{ alert: string }> = ({ alert }) => <div className="p-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg">🔥 {alert}</div>;
