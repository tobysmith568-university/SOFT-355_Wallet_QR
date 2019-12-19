import { IMock, Mock, It, Times } from "typemoq";
import { IRouter, Router } from "express";
import { assert } from "chai";
import { VerifyController } from "../../../src/contollers/verify.controller";
import { VerifyRoute } from "../../../src/api/routes/verify.route";

describe("In the verify route", async () => {
  let router: IMock<IRouter>;
  let verifyController: IMock<VerifyController>;

  let subject: VerifyRoute;

  beforeEach(() => {
    router = Mock.ofType<Router>();
    verifyController = Mock.ofType<VerifyController>();

    subject = new VerifyRoute(router.object, verifyController.object);
  });

  describe("setupRoutes", async () => {

    it("should set up the get route at /:token", async () => {
      subject.setupRoutes();
      router.verify(r => r.get("/:token", It.isAny()), Times.once());
    });
  });

  describe("getRouter", () => {
    it("should return the router", () => {
      assert.deepStrictEqual(subject.getRouter(), router.object);
    });
  });
});
