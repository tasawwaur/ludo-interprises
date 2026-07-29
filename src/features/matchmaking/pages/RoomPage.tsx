import React from "react";
import { useRoomStore } from "../rooms/RoomStore";
import { Card, Button, Avatar, Badge, Title, Subtitle, Flex, Grid } from "../../../components/ui";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

export const RoomPage: React.FC<{ onStartGame: () => void; onLeave: () => void }> = ({ onStartGame, onLeave }) => {
  const { roomCode, mode, members, leaveRoom, startGame } = useRoomStore();
  const user = useUserStore((s) => s.user);
  const hostName = user?.username || "Player 1";

  const handleStart = () => {
    startGame();
    onStartGame();
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center justify-center relative overflow-hidden select-none font-sans px-3">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="room" />

      <div className="w-full max-w-[430px] z-10 py-4 flex flex-col justify-center">
        <Card variant="solid" className="p-6 border-2 border-purple-500/40 bg-purple-950/80 backdrop-blur-md rounded-3xl shadow-2xl glow-purple-border">
          <Flex className="justify-between items-center mb-6 pb-4 border-b-2 border-purple-500/30">
            <div>
              <Title className="text-xl font-black tracking-wider text-white glow-amber-text uppercase">Ludo Match Lobby</Title>
              <Subtitle className="text-[11px] font-bold text-purple-200 mt-1">
                {mode} • Code: <span className="text-amber-400 font-mono font-black glow-amber-text ml-1">{roomCode || "PUBLIC"}</span>
              </Subtitle>
            </div>
            <Badge variant="emerald" className="font-black text-[10px]">2/4 Joined</Badge>
          </Flex>

          {/* Member Slots */}
          <Grid cols={2} className="gap-3 mb-6">
            <Card variant="glass" className="p-3 flex items-center justify-between border-2 border-amber-400/50 bg-black/40 rounded-2xl glow-gold-border">
              <Flex className="gap-3 items-center">
                <Avatar name={hostName} isOnline badge="RED" />
                <div>
                  <span className="font-black text-white text-xs block truncate max-w-[90px]">{hostName}</span>
                  <span className="text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-black mt-0.5 inline-block">HOST</span>
                </div>
              </Flex>
            </Card>

            <Card variant="glass" className="p-3 flex items-center justify-between border-2 border-purple-500/30 bg-black/40 rounded-2xl">
              <Flex className="gap-3 items-center">
                <Avatar name="Opponent AI" isOnline badge="GREEN" />
                <div>
                  <span className="font-black text-white text-xs block truncate max-w-[90px]">Opponent</span>
                  <span className="text-[8px] bg-emerald-500 text-slate-950 px-1 rounded font-black mt-0.5 inline-block">JOINED</span>
                </div>
              </Flex>
            </Card>
          </Grid>

          {/* Action Controls */}
          <Flex className="gap-3">
            <Button
              variant="danger"
              size="lg"
              className="w-1/2 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:brightness-110 text-white font-black text-xs uppercase rounded-xl border border-red-400 shadow-lg active:scale-95 transition-all"
              onClick={() => { leaveRoom(); onLeave(); }}
            >
              Leave Room
            </Button>
            <Button
              variant="neon"
              size="lg"
              className="w-1/2 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase rounded-xl border border-green-300 shadow-lg active:scale-95 transition-all"
              onClick={handleStart}
            >
              START GAME
            </Button>
          </Flex>
        </Card>
      </div>
    </div>
  );
};
