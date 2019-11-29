import { describe, it } from "mocha";
import { assert } from "chai";
import { Mock, IMock, It, Times } from "typemoq";
import { Request, Response } from "express";
import { UserController } from "../../src/contollers/user.controller";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { IUserDbo } from "../../src/database/models/user.dbo.interface";

describe("In the user controller", () => {
  
  let userRepository: IMock<UserRepository>;

  let subject: UserController;

  let req: IMock<Request>;
  let res: IMock<Response>;

  beforeEach(() => {
    userRepository = Mock.ofType<UserRepository>();

    subject = new UserController(userRepository.object);

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

  function given_userRepository_find_returns(users: IUserDbo[]) {
    userRepository
      .setup(u => u.find(It.isAny()))
      .returns(async () => users);
  }
});
