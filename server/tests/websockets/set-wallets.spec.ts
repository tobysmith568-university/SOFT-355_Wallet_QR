import { IMock, Mock, It, Times } from "typemoq";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { ITokenService } from "../../src/services/token.service.interface";
import { SetWallets } from "../../src/websockets/set-wallets";
import { Server, Namespace, Socket } from "socket.io";
import { fail } from "assert";
import { ISetWallets } from "../../src/websockets/models/set-wallets.interface";
import { IUserDbo } from "../../src/database/models/user.dbo.interface";
import { IWalletDbo } from "../../src/database/models/wallet.dbo.interface";
import { assert } from "chai";

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

  describe("set", () => {

    it("should verify the token parameter from the message", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      given_tokenService_verify_returnsWhenGiven(null, message.token);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      tokenService.verify(t => t.verify(message.token), Times.once());
    });

    it("should to nothing if the token service returns falsy", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      given_tokenService_verify_returnsWhenGiven(null, message.token);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      userRepository.verify(u => u.find(It.isAny()), Times.never());
    });

    it("should to nothing if the token service returns a string", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      given_tokenService_verify_returnsWhenGiven("This is a string", message.token);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      userRepository.verify(u => u.find(It.isAny()), Times.never());
    });

    it("should to nothing if the token service result's usr property is falsy", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      const tokenResult = {
        usr: null
      };

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      userRepository.verify(u => u.find(It.isAny()), Times.never());
    });

    it("should find from the user repository using the token service result's usr property", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      const tokenResult = {
        usr: "This is a username"
      };

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([]);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      userRepository.verify(u => u.find(It.isObjectWith({
        username: tokenResult.usr
      })), Times.once());
    });

    it("should do nothing if the found user has not verified their email", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.emailVerified)
        .returns(() => false);

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user.object ]);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      user.verify(u => u.save(), Times.never());
    });

    it("should set the user's wallets to those in the message", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: [
          {
            address: "Address #1",
            currency: "Currency #1",
            name: "Name #1"
          },
          {
            address: "Address #2",
            currency: "Currency #2",
            name: "Name #2"
          }
        ]
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.emailVerified)
        .returns(() => true);

      const toSocket = Mock.ofType<Socket>();

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user.object ]);
      given_socket_to_returns(toSocket.object);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      user.verify(u => u.wallets = [
        { address: "Address #1", currency: "Currency #1", name: "Name #1" } as IWalletDbo,
        { address: "Address #2", currency: "Currency #2", name: "Name #2" } as IWalletDbo
      ], Times.once());
    });

    it("should call save on the user", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: [
          {
            address: "Address #1",
            currency: "Currency #1",
            name: "Name #1"
          },
          {
            address: "Address #2",
            currency: "Currency #2",
            name: "Name #2"
          }
        ]
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.emailVerified)
        .returns(() => true);

      const toSocket = Mock.ofType<Socket>();

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user.object ]);
      given_socket_to_returns(toSocket.object);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      user.verify(u => u.save(), Times.once());
    });

    it("should call emit on the to socket", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: [
          {
            address: "Address #1",
            currency: "Currency #1",
            name: "Name #1"
          },
          {
            address: "Address #2",
            currency: "Currency #2",
            name: "Name #2"
          }
        ]
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.emailVerified)
        .returns(() => true);

      const toSocket = Mock.ofType<Socket>();

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user.object ]);
      given_socket_to_returns(toSocket.object);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      toSocket.verify(t => t.emit(It.isAny(), It.isAny()), Times.once());
    });

    it("should emit to 'wallets' on the to socket", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: [
          {
            address: "Address #1",
            currency: "Currency #1",
            name: "Name #1"
          },
          {
            address: "Address #2",
            currency: "Currency #2",
            name: "Name #2"
          }
        ]
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.emailVerified)
        .returns(() => true);

      const toSocket = Mock.ofType<Socket>();

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user.object ]);
      given_socket_to_returns(toSocket.object);
      given_subject_isCreated();

      await subject!.set(socket.object, message);

      toSocket.verify(t => t.emit("wallets", It.isAny()), Times.once());
    });
  });

  describe("add", () => {

    it("should verify the token parameter from the message", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      given_tokenService_verify_returnsWhenGiven(null, message.token);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      tokenService.verify(t => t.verify(message.token), Times.once());
    });

    it("should to nothing if the token service returns falsy", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      given_tokenService_verify_returnsWhenGiven(null, message.token);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      userRepository.verify(u => u.find(It.isAny()), Times.never());
    });

    it("should to nothing if the token service returns a string", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      given_tokenService_verify_returnsWhenGiven("This is a string", message.token);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      userRepository.verify(u => u.find(It.isAny()), Times.never());
    });

    it("should to nothing if the token service result's usr property is falsy", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      const tokenResult = {
        usr: null
      };

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      userRepository.verify(u => u.find(It.isAny()), Times.never());
    });

    it("should find from the user repository using the token service result's usr property", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      const tokenResult = {
        usr: "This is a username"
      };

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([]);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      userRepository.verify(u => u.find(It.isObjectWith({
        username: tokenResult.usr
      })), Times.once());
    });

    it("should do nothing if the found user has not verified their email", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: []
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.emailVerified)
        .returns(() => false);

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user.object ]);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      user.verify(u => u.save(), Times.never());
    });

    it("should add wallets in the message to the user's wallets", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: [
          {
            address: "Address #1",
            currency: "Currency #1",
            name: "Name #1"
          },
          {
            address: "Address #2",
            currency: "Currency #2",
            name: "Name #2"
          }
        ]
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user: IUserDbo = {
        emailVerified: true,
        wallets: [
          { address: "Address #0", currency: "Currency #0", name: "Name #0" } as IWalletDbo
        ],
        save() {}
      } as IUserDbo;

      const toSocket = Mock.ofType<Socket>();

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user ]);
      given_socket_to_returns(toSocket.object);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      assert.deepStrictEqual(user.wallets, [
        { address: "Address #0", currency: "Currency #0", name: "Name #0" } as IWalletDbo,
        { address: "Address #1", currency: "Currency #1", name: "Name #1" } as IWalletDbo,
        { address: "Address #2", currency: "Currency #2", name: "Name #2" } as IWalletDbo
      ]);
    });

    it("should call save on the user", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: [
          {
            address: "Address #1",
            currency: "Currency #1",
            name: "Name #1"
          },
          {
            address: "Address #2",
            currency: "Currency #2",
            name: "Name #2"
          }
        ]
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.emailVerified)
        .returns(() => true);
      user
        .setup(u => u.wallets)
        .returns(() => []);

      const toSocket = Mock.ofType<Socket>();

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user.object ]);
      given_socket_to_returns(toSocket.object);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      user.verify(u => u.save(), Times.once());
    });

    it("should call emit on the to socket", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: [
          {
            address: "Address #1",
            currency: "Currency #1",
            name: "Name #1"
          },
          {
            address: "Address #2",
            currency: "Currency #2",
            name: "Name #2"
          }
        ]
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.emailVerified)
        .returns(() => true);
      user
        .setup(u => u.wallets)
        .returns(() => []);

      const toSocket = Mock.ofType<Socket>();

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user.object ]);
      given_socket_to_returns(toSocket.object);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      toSocket.verify(t => t.emit(It.isAny(), It.isAny()), Times.once());
    });

    it("should emit to 'wallets' on the to socket", async () => {
      const message: ISetWallets = {
        token: "This is a token",
        wallets: [
          {
            address: "Address #1",
            currency: "Currency #1",
            name: "Name #1"
          },
          {
            address: "Address #2",
            currency: "Currency #2",
            name: "Name #2"
          }
        ]
      };

      const tokenResult = {
        usr: "This is a username"
      };

      const user = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.emailVerified)
        .returns(() => true);
      user
        .setup(u => u.wallets)
        .returns(() => []);

      const toSocket = Mock.ofType<Socket>();

      given_tokenService_verify_returnsWhenGiven(tokenResult, message.token);
      given_userRepository_find_returns([ user.object ]);
      given_socket_to_returns(toSocket.object);
      given_subject_isCreated();

      await subject!.add(socket.object, message);

      toSocket.verify(t => t.emit("wallets", It.isAny()), Times.once());
    });
  });

  function given_tokenService_verify_returnsWhenGiven(returns: string | object | null, whenGiven: string) {
    tokenService
      .setup(t => t.verify(whenGiven))
      .returns(async () => returns);
  }

  function given_userRepository_find_returns(returns: IUserDbo[]) {
    userRepository
      .setup(u => u.find(It.isAny()))
      .returns(async () => returns);
  }

  function given_socket_to_returns(returns: Socket) {
    socket
      .setup(s => s.to(It.isAny()))
      .returns(() => returns);
  }

  function given_server_of_returnsWhenGiven(returns: Namespace, whenGiven: string) {
    server
      .setup(s => s.of(whenGiven))
      .returns(() => returns);
  }

  function given_subject_isCreated() {
    subject = new SetWallets(server.object, tokenService.object, userRepository.object);
  }
});
