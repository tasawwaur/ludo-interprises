export interface Match { id: string; roomId: string; currentTurn: string; diceRoll: number; status: "PLAYING" | "FINISHED"; winnerId?: string; }
