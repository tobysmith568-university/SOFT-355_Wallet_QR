import { IMock, Mock, It, Times } from "typemoq";
import { IRouter, Router } from "express";
import { assert } from "chai";
import { WalletController } from "../../../src/contollers/wallet.controller";
import { WalletRoute } from "../../../src/api/routes/wallet.route";
import { TokenAuthenticator } from "../../../src/middlewares/token-authenticator";

describe("In the wallet route", async () => {
  let router: IMock<IRouter>;
  let walletController: IMock<WalletController>;
  let tokenMiddleware: IMock<TokenAuthenticator>;

  let subject: WalletRoute;

  beforeEach(() => {
    router = Mock.ofType<Router>();
    walletController = Mock.ofType<WalletController>();
    tokenMiddleware = Mock.ofType<TokenAuthenticator>();

    subject = new WalletRoute(router.object, walletController.object, tokenMiddleware.object);
  });

  describe("setupRoutes", async () => {

    it("should set up the post route at /wallet with authentication", async () => {
      subject.setupRoutes();
      router.verify(r => r.post("/wallet", tokenMiddleware.object.middleware(), It.isAny()), Times.once());
    });
  });

  describe("getRouter", () => {
    it("should return the router", () => {
      assert.deepStrictEqual(subject.getRouter(), router.object);
    });
  });
});
