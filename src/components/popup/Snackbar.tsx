import React from "react"; export const Snackbar: React.FC<{ msg: string }> = ({ msg }) => <div className="fixed bottom-0 inset-x-0 p-3 bg-slate-800 text-center">{msg}</div>;
