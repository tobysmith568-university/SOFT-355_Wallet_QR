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

  constructor(server: Server,
              private readonly tokenService: ITokenService,
              private readonly userRepository: UserRepository) {
    this.namespace = server.of("/editwallets");
  }
  
  public setup(): void {
    this.namespace.on("connection", (socket: Socket) => {
      socket.on("profile", async (msg) => this.onProfile(socket, msg));
      socket.on("set", async (msg) => this.set(socket, msg));
      socket.on("add", async (msg) => this.add(socket, msg));
    });
  }

  private async onProfile(socket: Socket, msg: any): Promise<void> {
    socket.leaveAll();
    socket.join(msg);
  }

  private async set(socket: Socket, msg: any): Promise<void> {
    const data = msg as ISetWallets;
    const payload = await this.tokenService.verify(data.token);

    if (!payload || typeof payload === "string") {
      return;
    }

    const username = (payload as any).usr;

    if (!username) {
      return;
    }

    const users = await this.userRepository.find({ username: username });

    if (users.length !== 1) {
      return;
    }

    const user = users[0];

    if (!user.emailVerified) {
      return;
    }

    user.wallets = this.mapWallets(data.wallets);

    await user.save();
    
    socket.to(username).emit("wallets", JSON.stringify({
      wallets: data.wallets
    } as IUpdatedWallets));
  }

  private async add(socket: Socket, msg: any): Promise<void> {
    const data = msg as ISetWallets;
    const payload = await this.tokenService.verify(data.token);

    if (!payload || typeof payload === "string") {
      return;
    }

    const username = (payload as any).usr;

    if (!username) {
      return;
    }

    const users = await this.userRepository.find({ username: username });

    if (users.length !== 1) {
      return;
    }

    const user = users[0];

    if (!user.emailVerified) {
      return;
    }

    data.wallets.forEach((wallet) => {
      user.wallets.push({
        name: wallet.name,
        currency: wallet.currency,
        address: wallet.address
      } as IWalletDbo);
    });

    await user.save();
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
