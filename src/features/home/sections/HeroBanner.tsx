import React from "react";
import { Button, Card, Title, Subtitle } from "../../../components/ui";

export const HeroBanner: React.FC = () => (
  <Card variant="gradient" className="relative overflow-hidden p-8 border border-indigo-500/30">
    <div className="relative z-10 max-w-lg">
      <span className="inline-block px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full mb-3 uppercase tracking-wider">
        🏆 SEASON 1 FINALS
      </span>
      <Title className="text-3xl mb-2 leading-tight">National Ludo Championship</Title>
      <Subtitle className="mb-6">Compete against 100,000+ players for a total prize pool of ₹1,00,000 INR!</Subtitle>
      <div className="flex items-center gap-3">
        <Button variant="amber" size="lg">Enter Championship</Button>
        <Button variant="glass" size="lg">View Rules</Button>
      </div>
    </div>
    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
  </Card>
);
