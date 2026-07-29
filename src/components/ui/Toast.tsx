import React from "react";

export interface ToastProps {
  message: string;
  type?: "info" | "success" | "error";
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  const bg = type === "success" ? "bg-emerald-600" : type === "error" ? "bg-rose-600" : "bg-indigo-600";
  return (
    <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl text-white font-bold shadow-2xl flex items-center gap-3 ${bg} animate-slideUp`}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} aria-label="Close notification" className="opacity-80 hover:opacity-100">✕</button>}
    </div>
  );
};
