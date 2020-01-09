import { IWebsocket } from "./websocket.interface";
import { Namespace, Server, Socket } from "socket.io";
import { UserRepository } from "../database/repositories/user.repository";
import { ISearchResult } from "./models/search-result.interface";

export class SearchUsers implements IWebsocket {

  private namespace: Namespace;

  constructor(server: Server,
    private readonly userRepository: UserRepository) {
    this.namespace = server.of("/searchusers");
  }

  setup(): void {
    this.namespace.on("connection", (socket: Socket) => {
      socket.on("search", async (msg) => this.search(socket, msg));
    });
  }

  async search(socket: Socket, msg: any) {
    const searchTerm = msg as string;
    
    const searchResults = await this.userRepository.search(searchTerm, 8);

    const results: ISearchResult[] = new Array();

    searchResults.forEach((result) => results.push({
      name: result.displayName,
      username: result.username
    }));

    socket.emit("results", results);
  }
}
