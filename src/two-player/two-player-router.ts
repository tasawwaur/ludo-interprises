// Two-Player Router — maps route keys to view states within the feature
export type TwoPlayerRoute =
  | 'LOBBY'
  | 'MATCHMAKING'
  | 'ROOM_CREATE'
  | 'ROOM_JOIN'
  | 'GAME'
  | 'RESULT'
  | 'HISTORY';

export interface RouterState {
  current: TwoPlayerRoute;
  params?: Record<string, string>;
}

class TwoPlayerRouter {
  private state: RouterState = { current: 'LOBBY' };
  private listeners: ((state: RouterState) => void)[] = [];

  navigate(route: TwoPlayerRoute, params?: Record<string, string>): void {
    this.state = { current: route, params };
    this.listeners.forEach((fn) => fn(this.state));
  }

  getState(): RouterState {
    return this.state;
  }

  subscribe(fn: (state: RouterState) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}

export const twoPlayerRouter = new TwoPlayerRouter();
