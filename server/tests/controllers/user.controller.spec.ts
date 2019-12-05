import { assert } from "chai";
import { describe, it } from "mocha";
import { MongoError } from "mongodb";
import { Request, Response } from "express";
import { Mock, IMock, It, Times } from "typemoq";
import { UserController } from "../../src/contollers/user.controller";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { IUserDbo } from "../../src/database/models/user.dbo.interface";
import { IPasswordService } from "../../src/services/password.service.interface";

describe("In the user controller", () => {
  
  let userRepository: IMock<UserRepository>;
  let passwordService: IMock<IPasswordService>;

  let subject: UserController;

  let req: IMock<Request>;
  let res: IMock<Response>;

  beforeEach(() => {
    userRepository = Mock.ofType<UserRepository>();
    passwordService = Mock.ofType<IPasswordService>();

    subject = new UserController(userRepository.object, passwordService.object);

    req = Mock.ofType<Request>();
    res = Mock.ofType<Response>();
  });

  describe("getById", () => {

    it("should not be null", () => {
      assert.isNotNull(subject.getById);
    });

    it("should return an error message when a user does not exist", async () => {

      given_userRepository_find_returns([]);

      await subject.getById(req.object, res.object);

      res.verify(r => r.json({error: "User could not be found"}), Times.once());
    });

    it("should return a user when they do exist", async () => {
      const username = "myUsername";

      given_userRepository_find_returns([{
        username: username
      } as IUserDbo]);

      await subject.getById(req.object, res.object);

      res.verify(r => r.json({
        name: undefined,
        username: username,
        email: undefined
      }), Times.once());
    });

    it("should return the first user when multiple do exist", async () => {
      const username = "myUsername";
      const wantedName = "myName";
      const unwantedName = "NOTmyName";

      given_userRepository_find_returns([{
        username: username,
        name: wantedName
      } as IUserDbo, {
        username: username,
        name: unwantedName
      } as IUserDbo]);

      await subject.getById(req.object, res.object);

      res.verify(r => r.json({
        name: wantedName,
        username: username,
        email: undefined
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
        name: body.name
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);

      await subject.create(req.object, res.object);

      userRepository.verify(u => u.create(It.isAny()), Times.once());
    });

    it("should return a valid user", async () => {

      const body = {
        username: "myUsername",
        email: "myEmail",
        name: "myName",
        password: "myPassword"
      };

      const newUser: IUserDbo = {
        username: body.username,
        email: body.email,
        name: body.name
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);

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
        name: body.name
      } as IUserDbo;

      given_req_body_equals(body);
      given_userRepository_create_returns(newUser);

      await subject.create(req.object, res.object);
      
      passwordService.verify(p => p.hash(password), Times.once());
    });
  });

  function given_req_body_equals(body: any) {
    req
      .setup(r => r.body)
      .returns(() => body);
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
});
