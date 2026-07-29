import React from "react"; export const Checkbox: React.FC<{ label: string }> = ({ label }) => <label className="flex items-center gap-2"><input type="checkbox" /><span>{label}</span></label>;
