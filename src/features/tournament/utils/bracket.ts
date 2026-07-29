import { RoundStructure } from '../types/bracket.types';

export const getRoundName = (roundNumber: number, totalRounds: number): string => {
  const diff = totalRounds - roundNumber;
  if (diff === 0) return 'Finals';
  if (diff === 1) return 'Semifinals';
  if (diff === 2) return 'Quarterfinals';
  return `Round of ${Math.pow(2, diff + 1)}`;
};

export const isBracketComplete = (rounds: RoundStructure[]): boolean => {
  if (rounds.length === 0) return false;
  const finalRound = rounds[rounds.length - 1];
  if (finalRound.matches.length === 0) return false;
  return finalRound.matches[0].status === 'COMPLETED';
};
