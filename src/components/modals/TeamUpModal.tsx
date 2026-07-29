import React, { useState } from 'react';
import { Card, Button, Title, Subtitle, Avatar, Badge, Flex } from '../ui';

interface TeamUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTeamMatch: () => void;
}

export const TeamUpModal: React.FC<TeamUpModalProps> = ({ isOpen, onClose, onStartTeamMatch }) => {
  const [copied, setCopied] = useState(false);
  const teamCode = '1129385';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <Card variant="solid" className="max-w-md w-full p-8 border-2 border-emerald-500/50 shadow-2xl bg-emerald-950/90 text-center relative overflow-hidden">
        {/* Title */}
        <Title className="text-3xl text-emerald-300 font-black mb-2 tracking-wide">🤝 TEAM UP 2v2</Title>
        <Subtitle className="text-emerald-100 text-xs mb-6">
          INVITE a friend to make a team. Game will start when your team is formed.
        </Subtitle>

        {/* Team Code Display */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 mb-6">
          <span className="text-xs text-emerald-400 font-bold block mb-1 uppercase tracking-wider">TEAM CODE</span>
          <span className="text-3xl font-black text-amber-400 font-mono tracking-widest block">{teamCode}</span>
        </div>

        {/* Member Slots */}
        <Flex className="justify-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <Avatar name="Player 1" isOnline badge="RED" />
            <span className="text-xs font-bold text-white mt-2">You (Host)</span>
            <Badge variant="emerald" className="text-[10px]">Ready ✓</Badge>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={handleCopy}
              className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center text-emerald-300 text-2xl font-bold hover:bg-emerald-800/40 transition-colors"
            >
              +
            </button>
            <span className="text-xs font-bold text-slate-300 mt-2">Partner Slot</span>
            <Badge variant="amber" className="text-[10px]">TAP TO INVITE</Badge>
          </div>
        </Flex>

        {/* Action Controls */}
        <Flex className="gap-3">
          <Button variant="glass" size="lg" className="w-1/2 border-slate-700" onClick={onClose}>
            BACK
          </Button>
          <Button variant="neon" size="lg" className="w-1/2 font-extrabold" onClick={onStartTeamMatch}>
            START 2v2 MATCH
          </Button>
        </Flex>
      </Card>
    </div>
  );
};
