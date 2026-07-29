import React from "react"; export const GlowEffect: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="shadow-[0_0_25px_rgba(99,102,241,0.5)]">{children}</div>;
