import { IMock, Mock, It, Times } from "typemoq";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { SearchUsers } from "../../src/websockets/search-users";
import { Server, Namespace, Socket } from "socket.io";
import { fail } from "assert";
import { IUserDbo } from "../../src/database/models/user.dbo.interface";

describe("In the search-users websocket", () => {

  let server: IMock<Server>;
  let userRepository: IMock<UserRepository>;

  let subject: SearchUsers | null;

  let namespace: IMock<Namespace>;
  let socket: IMock<Socket>;

  beforeEach(() => {
    server = Mock.ofType<Server>();
    userRepository = Mock.ofType<UserRepository>();

    subject = null;

    namespace = Mock.ofType<Namespace>();
    socket = Mock.ofType<Socket>();
  });

  describe("setup", () => {

    it("should setup a connection callback", () => {
      given_server_of_returnsWhenGiven(namespace.object, "/searchusers");
      given_subject_isCreated();

      if (subject == null) {
        fail("test subject needs to be created");
        return;
      }

      subject.setup();

      namespace.verify(n => n.on("connection", It.isAny()), Times.once());
    });
  });

  describe("search", () => {

    it("should search with the given term", async () => {
      const searchTerm = "This is a search term";

      given_userRepository_search_returnsWhenGiven([], searchTerm);
      given_subject_isCreated();

      await subject!.search(socket.object, searchTerm);

      userRepository.verify(u => u.search(searchTerm, It.isAny()), Times.once());
    });

    it("should searchfor up to 8 results", async () => {
      const searchTerm = "This is a search term";

      given_userRepository_search_returnsWhenGiven([], searchTerm);
      given_subject_isCreated();

      await subject!.search(socket.object, searchTerm);

      userRepository.verify(u => u.search(It.isAny(), 8), Times.once());
    });

    it("should emit 'results' to the socket", async () => {
      const searchTerm = "This is a search term";

      given_userRepository_search_returnsWhenGiven([], searchTerm);
      given_subject_isCreated();

      await subject!.search(socket.object, searchTerm);

      socket.verify(s => s.emit("results", It.isAny()), Times.once());
    });

    it("should emit the search results to the socket", async () => {
      const searchTerm = "This is a search term";
      const searchResults: IUserDbo[] = [
        {
          displayName: "Display name #1",
          username: "Username #1"
        } as IUserDbo,
        {
          displayName: "Display name #2",
          username: "Username #2"
        } as IUserDbo
      ];

      given_userRepository_search_returnsWhenGiven(searchResults, searchTerm);
      given_subject_isCreated();

      await subject!.search(socket.object, searchTerm);

      socket.verify(s => s.emit(It.isAny(), [
        { name: searchResults[0].displayName, username: searchResults[0].username },
        { name: searchResults[1].displayName, username: searchResults[1].username }
      ]), Times.once());
    });
  });

  function given_server_of_returnsWhenGiven(returns: Namespace, whenGiven: string) {
    server
      .setup(s => s.of(whenGiven))
      .returns(() => returns);
  }

  function given_subject_isCreated() {
    subject = new SearchUsers(server.object, userRepository.object);
  }

  function given_userRepository_search_returnsWhenGiven(returns: IUserDbo[], whenGiven: string) {
    userRepository
      .setup(u => u.search(whenGiven, It.isAny()))
      .returns(async () => returns);
  }
});
