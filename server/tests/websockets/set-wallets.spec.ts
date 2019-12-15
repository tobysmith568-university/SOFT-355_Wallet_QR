import { IMock, Mock, It, Times } from "typemoq";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { ITokenService } from "../../src/services/token.service.interface";
import { SetWallets } from "../../src/websockets/set-wallets";
import { Server, Namespace, Socket } from "socket.io";
import { fail } from "assert";

describe("In the set-wallet websocket", () => {

  let server: IMock<Server>;
  let userRepository: IMock<UserRepository>;
  let tokenService: IMock<ITokenService>;

  let subject: SetWallets | null;

  let namespace: IMock<Namespace>;
  let socket: IMock<Socket>;

  beforeEach(() => {
    server = Mock.ofType<Server>();
    userRepository = Mock.ofType<UserRepository>();
    tokenService = Mock.ofType<ITokenService>();

    subject = null;

    namespace = Mock.ofType<Namespace>();
    socket = Mock.ofType<Socket>();
  });

  describe("setup", () => {

    it("should setup a connection callback", () => {
      given_server_of_returnsWhenGiven(namespace.object, "/editwallets");
      given_subject_isCreated();

      if (subject == null) {
        fail("test subject needs to be created");
        return;
      }

      subject.setup();

      namespace.verify(n => n.on("connection", It.isAny()), Times.once());
    });
  });

  function given_server_of_returnsWhenGiven(returns: Namespace, whenGiven: string) {
    server
      .setup(s => s.of(whenGiven))
      .returns(() => returns);
  }

  function given_subject_isCreated() {
    subject = new SetWallets(server.object, tokenService.object, userRepository.object);
  }
});
