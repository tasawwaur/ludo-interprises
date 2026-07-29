import { Room } from "./Room"; export class RoomFactory { public createRoom(id: string = "room_1") { return new Room(id); } }
