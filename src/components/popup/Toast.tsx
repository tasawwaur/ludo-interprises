import React from "react"; export const Toast: React.FC<{ msg: string }> = ({ msg }) => <div className="fixed bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-xl shadow-2xl">{msg}</div>;
