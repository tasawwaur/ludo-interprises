import React from "react"; export const MessageBubble: React.FC<{ text: string }> = ({ text }) => <div className="p-2 bg-indigo-600 rounded-lg my-1">{text}</div>;
