import { assert } from "chai";
import { Request, Response } from "express";
import { IMock, Mock, It, Times } from "typemoq";
import { ISignIn } from "../../src/api/models/signin.interface";
import { IUserDbo } from "../../src/database/models/user.dbo.interface";
import { SignInController } from "../../src/contollers/signin.controller";
import { ITokenService } from "../../src/services/token.service.interface";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { IPasswordService } from "../../src/services/password.service.interface";

describe("In the signin controller", () => {

  let userRepository: IMock<UserRepository>;
  let passwordService: IMock<IPasswordService>;
  let tokenService: IMock<ITokenService>;

  let subject: SignInController;

  let req: IMock<Request>;
  let res: IMock<Response>;

  beforeEach(() => {
    userRepository = Mock.ofType<UserRepository>();
    passwordService = Mock.ofType<IPasswordService>();
    tokenService = Mock.ofType<ITokenService>();

    subject = new SignInController(userRepository.object, passwordService.object, tokenService.object);

    req = Mock.ofType<Request>();
    res = Mock.ofType<Response>();
  });

  describe("signin", () => {

    it("should not be null", () => {
      assert.isNotNull(subject.signIn);
    });
    
    it("should return an error message when a user does not exist", async () => {

      given_userRepository_find_returns([]);

      await subject.signIn(req.object, res.object);
      
      res.verify(r => r.json({error: "Account not found"}), Times.once());
    });

    it("should return an error message when a password is incorrect", async () => {
      const password = "thisIsMyPassword";
      const passwordHash = "thisIsMyPasswordHash";

      given_req_body_equals({
        password: password
      } as ISignIn);

      given_userRepository_find_returns([{
        username: "thisIsMyUsername",
        passwordHash: passwordHash
      } as IUserDbo]);

      given_passwordService_validate_returns_whenGiven(false, password, passwordHash);

      await subject.signIn(req.object, res.object);

    res.verify(r => r.json({error: "Incorrect password"}), Times.once());
    });

    it("should return a token when the given credentials are valid", async () => {
      const username = "thisIsMyUsername";
      const password = "thisIsMyPassword";
      const passwordHash = "thisIsMyPasswordHash";
      const token = "thisIsAToken";

      given_req_body_equals({
        password: password
      } as ISignIn);

      given_userRepository_find_returns([{
        username: username,
        passwordHash: passwordHash
      } as IUserDbo]);

      given_passwordService_validate_returns_whenGiven(true, password, passwordHash);
      given_tokenService_create_returns_whenGiven(token, username);

      await subject.signIn(req.object, res.object);

      res.verify(r => r.json({
        token: token,
        username: username
      }), Times.once());
    });
  });

  function given_req_body_equals(body: any) {
    req
      .setup(r => r.body)
      .returns(() => body);
  }
  
  function given_userRepository_find_returns(users: IUserDbo[]) {
    userRepository
      .setup(u => u.find(It.isAny()))
      .returns(async () => users);
  }

  function given_passwordService_validate_returns_whenGiven(returns: boolean, password: string, passwordHash: string) {
    passwordService
      .setup(p => p.validate(password, passwordHash))
      .returns(async () => returns);
  }

  function given_tokenService_create_returns_whenGiven(returns: string, username: string) {
    tokenService
      .setup(t => t.create(username))
      .returns(async () => returns);
  }
});
