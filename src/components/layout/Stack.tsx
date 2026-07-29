import React from "react"; export const Stack: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex flex-col gap-3">{children}</div>;
