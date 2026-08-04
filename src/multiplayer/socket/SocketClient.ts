import { io, Socket } from "socket.io-client"; 
import { getSocketUrl } from "../../utils/socketUrl";

export class SocketClient { 
  private static instance: SocketClient;
  public socket?: Socket; 

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) SocketClient.instance = new SocketClient();
    return SocketClient.instance;
  }

  public connect() { 
    if (this.socket?.connected) return;
    const socketUrl = getSocketUrl();
    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true
    }); 
  } 
}
export const globalSocket = SocketClient.getInstance();
