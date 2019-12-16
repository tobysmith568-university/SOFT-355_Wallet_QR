import { IWebsocket } from "./websocket.interface";
import { Server } from "socket.io";
import { UserRepository } from "../database/repositories/user.repository";

export class SearchUsers implements IWebsocket {

  constructor(private readonly server: Server,
              private readonly userRepository: UserRepository) {
  }

  setup(): void {
  }
}
