export type ConnectionState = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "SEARCHING" | "MATCH_FOUND" | "READY_CHECK" | "IN_ROOM" | "GAME_STARTING";

export class SocketClient {
  private static instance: SocketClient;
  private state: ConnectionState = "CONNECTED";
  private listeners: Map<string, Function[]> = new Map();

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) SocketClient.instance = new SocketClient();
    return SocketClient.instance;
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public emit(event: string, payload?: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(payload));
  }

  public on(event: string, cb: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }
}

export const socketClient = SocketClient.getInstance();
