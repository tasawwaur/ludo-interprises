import { GameReplayEvent, PlayerColor } from '../engine/Engine.types';

export class ReplayRecorder {
  private events: GameReplayEvent[] = [];
  private currentStep = 0;

  public recordEvent(
    type: GameReplayEvent['type'],
    color: PlayerColor,
    payload: Record<string, unknown>
  ) {
    this.events.push({
      step: this.events.length + 1,
      timestamp: Date.now(),
      type,
      color,
      payload,
    });
  }

  public getEvents(): GameReplayEvent[] {
    return [...this.events];
  }

  public reset() {
    this.events = [];
    this.currentStep = 0;
  }

  public exportJson(): string {
    return JSON.stringify({
      version: '1.0.0',
      totalSteps: this.events.length,
      events: this.events,
    }, null, 2);
  }
}
