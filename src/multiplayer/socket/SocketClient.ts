import { io, Socket } from "socket.io-client"; export class SocketClient { public socket?: Socket; public connect() { this.socket = io("http://localhost:8000"); } }
