import { PlacementId } from '../types/placement.types';
import { AD_PLACEMENTS } from '../constants/placement.constants';

export const FrequencyService = {
  checkLimitsAllowed: (placementId: PlacementId): boolean => {
    const config = AD_PLACEMENTS.find((p) => p.id === placementId);
    if (!config) return false;

    // Standard simulation: always allowed unless configured false
    return config.isEnabled;
  },
};
export default FrequencyService;
