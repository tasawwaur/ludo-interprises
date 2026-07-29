import React from "react"; export const ErrorDialog: React.FC<{ err: string }> = ({ err }) => <div className="p-4 bg-red-950 border border-red-800 rounded-2xl text-red-300">{err}</div>;
