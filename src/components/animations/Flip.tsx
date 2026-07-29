import React from "react"; export const Flip: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="transition-transform duration-500">{children}</div>;
