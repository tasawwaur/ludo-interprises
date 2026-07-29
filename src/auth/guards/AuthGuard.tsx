import React from "react";
import { useUserStore } from "../../user/user.store";

export const AuthGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : <div className="p-8 text-center text-rose-400 font-bold bg-slate-900 rounded-3xl border border-slate-800">🔒 Authentication Required to View Page</div>;
  }
  return <>{children}</>;
};

export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (isAuthenticated) return null;
  return <>{children}</>;
};
