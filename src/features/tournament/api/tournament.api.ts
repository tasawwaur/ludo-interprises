import { TournamentItem } from '../types/tournament.types';
import { INITIAL_TOURNAMENTS } from '../constants/tournament.constants';

export const fetchTournamentsListApi = async (): Promise<TournamentItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(INITIAL_TOURNAMENTS);
    }, 200);
  });
};
