import React, { useState, useEffect } from "react";
import { useQueueStore } from "../queue/QueueStore";
import { Modal, Button, Badge } from "../../../components/ui";

export const ReadyCheck: React.FC<{ onMatchAccepted: () => void }> = ({ onMatchAccepted }) => {
  const { readyCheck, mode, acceptMatch, cancelQueue } = useQueueStore();
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    if (!readyCheck) return;
    setTimer(10);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          cancelQueue();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [readyCheck, cancelQueue]);

  if (!readyCheck) return null;

  const handleAccept = () => {
    acceptMatch();
    onMatchAccepted();
  };

  return (
    <Modal isOpen={readyCheck} onClose={cancelQueue} title="🎉 MATCH FOUND!">
      <div className="flex flex-col items-center gap-4 text-center p-4">
        <Badge variant="amber">{mode}</Badge>
        <p className="text-sm text-slate-300">Your match is ready! Confirm to enter game arena.</p>
        <div className="w-16 h-16 rounded-full border-4 border-amber-500 flex items-center justify-center font-black text-2xl text-amber-400 animate-pulse">
          {timer}s
        </div>
        <div className="flex gap-3 w-full mt-2">
          <Button variant="danger" size="lg" className="w-1/2" onClick={cancelQueue}>Decline</Button>
          <Button variant="neon" size="lg" className="w-1/2" onClick={handleAccept}>ACCEPT MATCH</Button>
        </div>
      </div>
    </Modal>
  );
};
