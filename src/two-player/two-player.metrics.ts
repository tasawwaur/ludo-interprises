export interface MatchTelemetry {
  totalTurns: number;
  totalSixes: number;
  totalCaptures: number;
  durationSeconds: number;
}

const STORAGE_METRICS_KEY = 'ludo_two_player_metrics_v1';

export const TwoPlayerMetrics = {
  getSavedMetrics: (): MatchTelemetry[] => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_METRICS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  },

  saveMatchTelemetry: (metrics: MatchTelemetry) => {
    if (typeof window !== 'undefined') {
      const existing = TwoPlayerMetrics.getSavedMetrics();
      existing.push(metrics);
      localStorage.setItem(STORAGE_METRICS_KEY, JSON.stringify(existing));
    }
  },
};
export default TwoPlayerMetrics;
