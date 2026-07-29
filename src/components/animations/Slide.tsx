import React from "react"; export const Slide: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="transition-transform duration-300">{children}</div>;
