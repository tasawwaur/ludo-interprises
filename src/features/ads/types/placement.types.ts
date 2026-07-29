import { AdType } from './ads.types';

export type PlacementId =
  | 'home_banner'
  | 'matchmaker_loading'
  | 'match_result_interstitial'
  | 'reward_center_video'
  | 'lucky_spin_multiplier'
  | 'app_startup';

export interface AdPlacement {
  id: PlacementId;
  type: AdType;
  description: string;
  isEnabled: boolean;
  frequencyCapMinutes: number; // Max plays per minutes
  dailyCapCount: number;       // Max plays per day
}
export interface PlacementTelemetry {
  placementId: PlacementId;
  impressionsToday: number;
  lastShownTimestamp?: string;
}
