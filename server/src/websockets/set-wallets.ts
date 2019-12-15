import { IWebsocket } from "./websocket.interface";
import { Namespace, Server, Socket } from "socket.io";
import { ITokenService } from "../services/token.service.interface";
import { ISetWallets } from "./models/set-wallets.interface";
import { UserRepository } from "../database/repositories/user.repository";
import { IWalletDbo } from "../database/models/wallet.dbo.interface";
import { IWallet } from "./models/wallet.interface";
import { IUpdatedWallets } from "./models/updated-wallets.interface";

export class SetWallets implements IWebsocket {

  private namespace: Namespace;

  constructor(private readonly server: Server,
              private readonly tokenService: ITokenService,
              private readonly userRepository: UserRepository) {
    this.namespace = server.of("/editwallets");
  }
  
  public setup(): void {
    this.namespace.on("connection", (socket: Socket) => {
      socket.on("profile", async (msg) => this.onProfile(socket, msg));
      socket.on("set", async (msg) => this.set(socket, msg));
    });
  }

  private async onProfile(socket: Socket, msg: any): Promise<void> {
    socket.leaveAll();
    socket.join(msg);
  }

  private async set(socket: Socket, msg: any): Promise<void> {
    const data = msg as ISetWallets;
    const username = await this.tokenService.verify(data.token);

    if (!username) {
      return;
    }

    const users = await this.userRepository.find({ username: username });

    if (users.length !== 1) {
      return;
    }

    const user = users[0];

    user.wallets = this.mapWallets(data.wallets);

    await user.save();
    
    socket.to(username).emit("wallets", JSON.stringify({
      wallets: data.wallets
    } as IUpdatedWallets));
  }

  private mapWallets(wallets: IWallet[]): IWalletDbo[] {
    const result = new Array<IWalletDbo>();

    wallets.forEach((wallet) => {
      result.push({
        name: wallet.name,
        currency: wallet.currency,
        address: wallet.address
      } as IWalletDbo);
    });

    return result;
  }
}
