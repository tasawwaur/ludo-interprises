import { io, Socket } from "socket.io-client"; 
export class SocketClient { 
  private static instance: SocketClient;
  public socket?: Socket; 

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) SocketClient.instance = new SocketClient();
    return SocketClient.instance;
  }

  public connect() { 
    if (this.socket?.connected) return;
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    this.socket = io(`http://${host}:8000`, {
      transports: ["websocket", "polling"],
      reconnection: true
    }); 
  } 
}
export const globalSocket = SocketClient.getInstance();
