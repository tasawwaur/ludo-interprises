import React from "react"; export const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="transition-opacity duration-300">{children}</div>;
