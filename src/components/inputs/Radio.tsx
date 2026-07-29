import React from "react"; export const Radio: React.FC<{ label: string }> = ({ label }) => <label className="flex items-center gap-2"><input type="radio" /><span>{label}</span></label>;
