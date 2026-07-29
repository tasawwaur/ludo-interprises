import React from "react";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  badge?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name = "User", size = "md", isOnline = false, badge }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl"
  };

  const getInitials = (n: string) => n.slice(0, 2).toUpperCase();

  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white shadow-lg ring-2 ring-indigo-500/30`}>
        {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{getInitials(name)}</span>}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-sm"></span>
      )}
      {badge && (
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full shadow">
          {badge}
        </span>
      )}
    </div>
  );
};
