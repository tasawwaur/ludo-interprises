export interface GameState { matchId: string; currentTurnColor: "RED" | "GREEN" | "YELLOW" | "BLUE"; diceValue: number; tokens: Record<string, number[]>; }
