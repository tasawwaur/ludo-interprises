import { DiceSkin } from '../types/skin.types';
import { INITIAL_DICE_SKINS } from '../constants/skins.constants';

export const fetchDiceSkinsApi = async (): Promise<DiceSkin[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(INITIAL_DICE_SKINS);
    }, 200);
  });
};
