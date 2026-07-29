import React from "react"; export const ProfileCard: React.FC<{ user: string }> = ({ user }) => <div className="p-5 bg-slate-900 rounded-2xl"><h2>{user}</h2></div>;
