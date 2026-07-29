import React from "react"; export const Notification: React.FC<{ msg: string }> = ({ msg }) => <div className="p-3 bg-slate-800 rounded-xl">{msg}</div>;
