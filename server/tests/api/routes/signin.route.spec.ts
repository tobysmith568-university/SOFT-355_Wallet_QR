import { IMock, Mock, It, Times } from "typemoq";
import { IRouter, Router } from "express";
import { SignInController } from "../../../src/contollers/signin.controller";
import { SignInRoute } from "../../../src/api/routes/signin.route";

describe("In the signin route", async () => {
  let router: IMock<IRouter>;
  let signInController: IMock<SignInController>;

  let subject: SignInRoute;

  beforeEach(() => {
    router = Mock.ofType<Router>();
    signInController = Mock.ofType<SignInController>();

    subject = new SignInRoute(router.object, signInController.object);
  });

  describe("setupRoutes", async () => {

    it("should set up the post route at /signin", async () => {
      subject.setupRoutes();
      router.verify(r => r.post("/signin", It.isAny()), Times.once());
    });
  });
});
