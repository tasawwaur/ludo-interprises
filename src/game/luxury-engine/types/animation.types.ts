export interface AnimationTask {
  id: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  durationMs: number;
  onUpdate: (progress: number) => void;
  onComplete: () => void;
  onCancel?: () => void;
}
