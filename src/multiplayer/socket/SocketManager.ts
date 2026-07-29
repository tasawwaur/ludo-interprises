export class SocketManager { private static instance: SocketManager; public static getInstance() { return this.instance || (this.instance = new SocketManager()); } }
