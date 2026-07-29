import { RoundStructure } from '../types/bracket.types';
import { INITIAL_8P_BRACKET } from '../constants/bracket.constants';

export const fetchBracketRoundsApi = async (tournamentId: string): Promise<RoundStructure[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(INITIAL_8P_BRACKET);
    }, 200);
  });
};
export const syncBracketWithServerApi = async (tournamentId: string, rounds: RoundStructure[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 300);
  });
};
