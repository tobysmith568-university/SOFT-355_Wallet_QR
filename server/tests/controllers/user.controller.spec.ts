import { assert } from "chai";
import { describe, it } from "mocha";
import { MongoError } from "mongodb";
import { Request, Response } from "express";
import { Mock, IMock, It, Times } from "typemoq";
import { UserController } from "../../src/contollers/user.controller";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { IUserDbo } from "../../src/database/models/user.dbo.interface";
import { IPasswordService } from "../../src/services/password.service.interface";
import { IWallet } from "../../src/api/models/wallet.interface";
import { ParamsDictionary } from "express-serve-static-core";
import { IWalletDbo } from "../../src/database/models/wallet.dbo.interface";
import { IEmailService } from "../../src/services/email.service";
import { IFileService } from "../../src/services/file.service.interface";
import { ITokenService } from "../../src/services/token.service.interface";
import { Config } from "../../src/config/config";

describe("In the user controller", () => {
  
  let userRepository: IMock<UserRepository>;
  let passwordService: IMock<IPasswordService>;
  let emailService: IMock<IEmailService>;
  let tokenService: IMock<ITokenService>;
  let fileService: IMock<IFileService>;
  let config: IMock<Config>;

  let subject: UserController;

  let req: IMock<Request>;
  let res: IMock<Response>;

  beforeEach(() => {
    userRepository = Mock.ofType<UserRepository>();
    passwordService = Mock.ofType<IPasswordService>();
    emailService = Mock.ofType<IEmailService>();
    tokenService = Mock.ofType<ITokenService>();
    fileService = Mock.ofType<IFileService>();
    config = Mock.ofType<Config>();

    subject = new UserController(userRepository.object, passwordService.object, emailService.object, tokenService.object, config.object, fileService.object);

    req = Mock.ofType<Request>();
    res = Mock.ofType<Response>();
  });

  describe("getById", () => {

    it("should not be null", () => {
      assert.isNotNull(subject.getById);
    });

    it("should return an error message when a user does not exist", async () => {
      const username = "thisIsMyUsername";

      given_req_params_has("username", username);

      given_userRepository_find_returns([]);

      await subject.getById(req.object, res.object);

      res.verify(r => r.json({error: "@" + username + " does not exist :("}), Times.once());
    });

    it("should return a user when they do exist", async () => {
      const username = "myUsername";

      given_userRepository_find_returns([{
        username: username,
        wallets: new Array<IWallet>(),
        emailVerified: false
      } as IUserDbo]);

      await subject.getById(req.object, res.object);

      res.verify(r => r.json({
        displayName: undefined,
        username: username,
        wallets: new Array<IWallet>(),
        emailVerified: false
      }), Times.once());
    });

    it("should return the first user when multiple do exist", async () => {
      const username = "myUsername";
      const wantedName = "myName";
      const unwantedName = "NOTmyName";

      given_userRepository_find_returns([{
        username: username,
        displayName: wantedName,
        wallets: new Array<IWallet>(),
        emailVerified: true
      } as IUserDbo, {
        username: username,
        displayName: unwantedName,
        wallets: new Array<IWallet>(),
        emailVerified: false
      } as IUserDbo]);

      await subject.getById(req.object, res.object);

      res.verify(r => r.json({
        displayName: wantedName,
        username: username,
        wallets: new Array<IWallet>(),
        emailVerified: true
      }), Times.once());
    });
  });

  describe("create", () => {

    it("should not be null", () => {
      assert.isNotNull(subject.create);
    });

    it("should create a valid user", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        name: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.name,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);

      userRepository.verify(u => u.create(It.isAny()), Times.once());
    });

    it("should return a valid user", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);

      res.verify(r => r.json(newUser), Times.once());
    });

    it("should return a specific error for duplicate usernames", async () => {

      const ex = new MongoError("");
      ex.code = 11000;

      given_userRepository_create_throws(ex);

      await subject.create(req.object, res.object);

      res.verify(r => r.json({error: "This username has already been used"}), Times.once());
    });

    it("should return generic errors exactly", async () => {
      const errorMessage = "This is an error message";
      const ex = new MongoError(errorMessage);

      given_userRepository_create_throws(ex);

      await subject.create(req.object, res.object);

      res.verify(r => r.json({error: `User could not be created: MongoError: ${errorMessage}`}), Times.once());
    });

    it("should hash the password", async () => {
      
      const password = "myPassword";

      const body = {
        username: "myUsername",
        email: "myEmail",
        name: "myName",
        password: password
      };
      
      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.name,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);
      
      passwordService.verify(p => p.hash(password), Times.once());
    });

    it("should generate a token", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);

      tokenService.verify(t => t.create(It.isAny(), It.isAny(), It.isAny()), Times.once());
    });

    it("should generate a token with the correct username", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);

      tokenService.verify(t => t.create(body.username, It.isAny(), It.isAny()), Times.once());
    });

    it("should generate a token with a lifespan of 24 hours", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);

      tokenService.verify(t => t.create(It.isAny(), "24 hours", It.isAny()), Times.once());
    });

    it("should generate a token with a 'use' of 'activation'", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);

      const map = new Map<string, string>([
        [ "use", "activation" ]
      ]);

      tokenService.verify(t => t.create(It.isAny(), It.isAny(), map), Times.once());
    });

    it("should send an email", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);

      emailService.verify(e => e.sendHTMLEmail(It.isAny(), It.isAny(), It.isAny()), Times.once());
    });

    it("should send an email to the user's email address", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);

      emailService.verify(e => e.sendHTMLEmail(body.email, It.isAny(), It.isAny()), Times.once());
    });

    it("should send an email with the correct subject", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");

      await subject.create(req.object, res.object);

      emailService.verify(e => e.sendHTMLEmail(It.isAny(), "Welcome to WalletQR!", It.isAny()), Times.once());
    });

    it("should send an email with the correct body", async () => {

      const fileContent = "This is some content from a file";

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");
      given_fileService_readFile_returns(fileContent);

      subject = new UserController(userRepository.object, passwordService.object, emailService.object, tokenService.object, config.object, fileService.object);

      await subject.create(req.object, res.object);

      emailService.verify(e => e.sendHTMLEmail(It.isAny(), It.isAny(), fileContent), Times.once());
    });

    it("should send an email with the correct string-interpolated body", async () => {

      const fileContent = "My name should appear here --> ${name} <--";

      const body = {
        username: "myUsername",
        email: "myEmail",
        displayName: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        displayName: body.displayName,
        wallets: new Array<IWallet>()
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);
      given_tokenService_create_returns("token");
      given_fileService_readFile_returns(fileContent);

      subject = new UserController(userRepository.object, passwordService.object, emailService.object, tokenService.object, config.object, fileService.object);

      await subject.create(req.object, res.object);

      emailService.verify(e => e.sendHTMLEmail(It.isAny(), It.isAny(), `My name should appear here --> ${body.displayName} <--`), Times.once());
    });
  });

  describe("modify", () => {

    it("should not be null", () => {
      assert.isNotNull(subject.modify);
    });

    it("should return an error message if a user is not logged in", async () => {
      given_req_username_equals(undefined);

      await subject.modify(req.object, res.object);

      res.verify(r => r.json({
        error: "You are not logged in"
      }), Times.once());
    });

    it("should return a 401 if a user is not logged in", async () => {
      given_req_username_equals(undefined);

      await subject.modify(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message if a user has an empty username", async () => {
      given_req_username_equals("");

      await subject.modify(req.object, res.object);

      res.verify(r => r.json({
        error: "You are not logged in"
      }), Times.once());
    });

    it("should return a 401 if a user has an empty username", async () => {
      given_req_username_equals("");

      await subject.modify(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message if a user tries to modify a different user", async () => {
      const usernameOfUser = "MyUsername";
      const usernameOfSomeoneElse = "NotMyUsername";

      given_req_username_equals(usernameOfUser);
      given_req_params_has("username", usernameOfSomeoneElse);

      await subject.modify(req.object, res.object);

      res.verify(r => r.json({
        error: "You do not have permission to edit this user"
      }), Times.once());
    });

    it("should return a 401 if a user tries to modify a different user", async () => {
      const usernameOfUser = "MyUsername";
      const usernameOfSomeoneElse = "NotMyUsername";

      given_req_username_equals(usernameOfUser);
      given_req_params_has("username", usernameOfSomeoneElse);

      await subject.modify(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message if a token is vaild but the account can no longer be found", async () => {
      const username = "MyUsername";

      given_req_username_equals(username);
      given_req_params_has("username", username);
      given_userRepository_find_returns([]);

      await subject.modify(req.object, res.object);

      res.verify(r => r.json({
        error: "This account no longer exists"
      }), Times.once());
    });

    it("should return a 401 if a token is vaild but the account can no longer be found", async () => {
      const username = "MyUsername";

      given_req_username_equals(username);
      given_req_params_has("username", username);
      given_userRepository_find_returns([]);

      await subject.modify(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should overwrite the user's email address", async () => {
      const username = "MyUsername";
      const oldEmail = "oldEmail";
      const newEmail = "newEmail";

      const userDbo: IMock<IUserDbo> = Mock.ofType<IUserDbo>();
      userDbo.target.email = oldEmail;
      userDbo.setup(u => u.save()).returns(async () => ({ } as IUserDbo));

      given_req_username_equals(username);
      given_req_params_has("username", username);
      given_req_body_equals({
        email: newEmail
      } as Partial<IUserDbo>);
      given_userRepository_find_returns([ userDbo.object ]);

      await subject.modify(req.object, res.object);

      assert.deepStrictEqual(userDbo.target.email, newEmail);
    });

    it("should overwrite the user's display name", async () => {
      const username = "MyUsername";
      const oldDisplayName = "oldDisplayName";
      const newDisplayName = "newDisplayName";

      const userDbo: IMock<IUserDbo> = Mock.ofType<IUserDbo>();
      userDbo.target.displayName = oldDisplayName;
      userDbo.setup(u => u.save()).returns(async () => ({ } as IUserDbo));

      given_req_username_equals(username);
      given_req_params_has("username", username);
      given_req_body_equals({
        displayName: newDisplayName
      } as Partial<IUserDbo>);
      given_userRepository_find_returns([ userDbo.object ]);

      await subject.modify(req.object, res.object);

      assert.deepStrictEqual(userDbo.target.displayName, newDisplayName);
    });

    it("should not overwrite the user's wallets if they have not verified their email", async () => {
      const username = "MyUsername";

      const oldWallets: IWalletDbo[] = [
        {
          name: "oldName",
          currency: "oldCurrency",
          address: "oldAddress"
        } as IWalletDbo
      ];

      const newWallets: IWalletDbo[] = [
        {
          name: "newName",
          currency: "newCurrency",
          address: "newAddress"
        } as IWalletDbo
      ];

      const userDbo: IMock<IUserDbo> = Mock.ofType<IUserDbo>();
      userDbo.setup(u => u.emailVerified). returns(() => false);
      userDbo.target.wallets = oldWallets;
      userDbo.setup(u => u.save()).returns(async () => ({ } as IUserDbo));

      given_req_username_equals(username);
      given_req_params_has("username", username);
      given_req_body_equals({
        wallets: newWallets
      } as Partial<IUserDbo>);
      given_userRepository_find_returns([ userDbo.object ]);

      await subject.modify(req.object, res.object);

      assert.deepStrictEqual(userDbo.target.wallets, oldWallets);
    });

    it("should overwrite the user's wallets if they have verified their email", async () => {
      const username = "MyUsername";

      const oldWallets: IWalletDbo[] = [
        {
          name: "oldName",
          currency: "oldCurrency",
          address: "oldAddress"
        } as IWalletDbo
      ];

      const newWallets: IWalletDbo[] = [
        {
          name: "newName",
          currency: "newCurrency",
          address: "newAddress"
        } as IWalletDbo
      ];

      const userDbo: IMock<IUserDbo> = Mock.ofType<IUserDbo>();
      userDbo.setup(u => u.emailVerified). returns(() => true);
      userDbo.target.wallets = oldWallets;
      userDbo.setup(u => u.save()).returns(async () => ({ } as IUserDbo));

      given_req_username_equals(username);
      given_req_params_has("username", username);
      given_req_body_equals({
        wallets: newWallets
      } as Partial<IUserDbo>);
      given_userRepository_find_returns([ userDbo.object ]);

      await subject.modify(req.object, res.object);

      assert.deepStrictEqual(userDbo.target.wallets, newWallets);
    });

    it("should call save on the user", async () => {
      const username = "MyUsername";

      const userDbo: IMock<IUserDbo> = Mock.ofType<IUserDbo>();
      userDbo.setup(u => u.save()).returns(async () => ({ } as IUserDbo));

      given_req_username_equals(username);
      given_req_params_has("username", username);
      given_req_body_equals({ } as Partial<IUserDbo>);
      given_userRepository_find_returns([ userDbo.object ]);

      await subject.modify(req.object, res.object);

      userDbo.verify(u => u.save(), Times.once());
    });

    it("should return a 204", async () => {
      const username = "MyUsername";

      const userDbo: IMock<IUserDbo> = Mock.ofType<IUserDbo>();
      userDbo.setup(u => u.save()).returns(async () => ({ } as IUserDbo));

      given_req_username_equals(username);
      given_req_params_has("username", username);
      given_req_body_equals({ } as Partial<IUserDbo>);
      given_userRepository_find_returns([ userDbo.object ]);

      await subject.modify(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 204);
    });
  });

  describe("exists", () => {

    it("should not be null", () => {
      assert.isNotNull(subject.exists);
    });

    it("should return a 404 when a user does not exist", async () => {
      const username = "thisIsMyUsername";

      given_req_params_has("username", username);

      given_userRepository_find_returns([]);

      await subject.exists(req.object, res.object);

      res.verify(r => r.status(404), Times.once());
    });

    it ("should return no body when a user does not exist", async () => {
      const username = "thisIsMyUsername";

      given_req_params_has("username", username);

      given_userRepository_find_returns([]);

      await subject.exists(req.object, res.object);

      then_response_body_wasNeverSet();
    });

    it("should return a 200 when a user does exist", async () => {
      const username = "thisIsMyUsername";

      given_req_params_has("username", username);

      given_userRepository_find_returns([{
        username: username,
        wallets: new Array<IWallet>()
      } as IUserDbo]);

      await subject.exists(req.object, res.object);

      res.verify(r => r.status(200), Times.once());
    });

    it("should return no body when a user does exist", async () => {
      const username = "thisIsMyUsername";

      given_req_params_has("username", username);

      given_userRepository_find_returns([{
        username: username,
        wallets: new Array<IWallet>()
      } as IUserDbo]);

      await subject.exists(req.object, res.object);

      then_response_body_wasNeverSet();
    });
  });

  function given_req_body_equals(body: any) {
    req
      .setup(r => r.body)
      .returns(() => body);
  }

  function given_req_params_has(key: string, value: string) {
    const params = Mock.ofType<ParamsDictionary>();
    params
      .setup(t => t[key])
      .returns(() => value);

    req
      .setup(r => r.params)
      .returns(() => params.object);
  }

  function given_req_username_equals(username: string | undefined) {
    req
      .setup(r => r.username)
      .returns(() => username);
  }

  function given_userRepository_create_returns(returns: IUserDbo) {
    userRepository
      .setup(u => u.create(It.isAny()))
      .returns(async () => returns);
  }

  function given_userRepository_create_throws(ex: Error) {
    userRepository
      .setup(u => u.create(It.isAny()))
      .throws(ex);
  }

  function given_userRepository_find_returns(users: IUserDbo[]) {
    userRepository
      .setup(u => u.find(It.isAny()))
      .returns(async () => users);
  }

  function given_tokenService_create_returns(token: string) {
    tokenService
      .setup(t => t.create(It.isAny(), It.isAny(), It.isAny()))
      .returns(async () => token);
  }

  function given_fileService_readFile_returns(fileContent: string) {
    fileService
      .setup(f => f.readFile(It.isAny()))
      .returns(() => fileContent);
  }

  function then_response_body_wasNeverSet() {
    res.verify(r => r.json(It.isAny()), Times.never());
    res.verify(r => r.jsonp(It.isAny()), Times.never());
    res.verify(r => r.end(It.isAny()), Times.never());
    res.verify(r => r.send(It.isAny()), Times.once());
    res.verify(r => r.send(), Times.once());
  }
});
