import { AD_PLACEMENTS } from '../constants/placement.constants';
import { PlacementId } from '../types/placement.types';

export const PlacementService = {
  isPlacementEnabled: (placementId: PlacementId): boolean => {
    const config = AD_PLACEMENTS.find((p) => p.id === placementId);
    return config ? config.isEnabled : false;
  },

  getPlacementConfig: (placementId: PlacementId) => {
    return AD_PLACEMENTS.find((p) => p.id === placementId);
  },
};
export default PlacementService;
