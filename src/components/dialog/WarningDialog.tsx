import React from "react"; export const WarningDialog: React.FC<{ msg: string }> = ({ msg }) => <div className="p-4 bg-amber-950 border border-amber-800 rounded-2xl text-amber-300">{msg}</div>;
