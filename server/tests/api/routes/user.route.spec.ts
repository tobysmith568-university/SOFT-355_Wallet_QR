import { describe, it } from "mocha";
import { assert } from "chai";
import { Mock, IMock, It, Times } from "typemoq";
import { UserRoute } from "../../../src/api/routes/user.route";
import { Router, IRouter } from "express";
import { UserController } from "../../../src/contollers/user.controller";

describe("In the user route", () => {
  let router: IMock<IRouter>;
  let userController: IMock<UserController>;

  let subject: UserRoute;

  beforeEach(() => {
    router = Mock.ofType<Router>();
    userController = Mock.ofType<UserController>();

    subject = new UserRoute(router.object, userController.object);
  });

  describe("setupRoutes", () => {
    it("should set up the route at /users/:username", async () => {
      const path = "/users/:username";

      subject.setupRoutes();

      router.verify(r => r.get(path, It.isAny()), Times.once());
    });
  });

  describe("getRouter", () => {
    it("should return the router", () => {
      assert.deepStrictEqual(subject.getRouter(), router.object);
    });
  });

});
