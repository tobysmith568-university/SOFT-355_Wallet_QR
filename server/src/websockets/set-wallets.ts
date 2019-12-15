import { IWebsocket } from "./websocket.interface";
import { Server } from "socket.io";
import { ITokenService } from "../services/token.service.interface";
import { UserRepository } from "../database/repositories/user.repository";

export class SetWallets implements IWebsocket {

  constructor(private readonly server: Server,
              private readonly tokenService: ITokenService,
              private readonly userRepository: UserRepository) {
  }
  
  public setup(): void {
  }
}
