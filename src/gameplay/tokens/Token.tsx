import React from "react"; export const Token: React.FC<{ color: string }> = ({ color }) => <div className={`w-8 h-8 rounded-full border-2 border-white bg-${color}-500`}></div>;
