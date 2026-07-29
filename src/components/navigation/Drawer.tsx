import React from "react"; export const Drawer: React.FC<{ isOpen: boolean }> = ({ isOpen }) => isOpen ? <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 p-4">Drawer</div> : null;
