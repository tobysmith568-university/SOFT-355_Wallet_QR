import { IMock, Mock, It, Times } from "typemoq";
import { IRouter, Router } from "express";
import { QRController } from "../../../src/contollers/qr.controller";
import { QRRoute } from "../../../src/api/routes/qr.route";
import { assert } from "chai";

describe("In the QR route", async () => {
  let router: IMock<IRouter>;
  let qrController: IMock<QRController>;

  let subject: QRRoute;

  beforeEach(() => {
    router = Mock.ofType<Router>();
    qrController = Mock.ofType<QRController>();

    subject = new QRRoute(router.object, qrController.object);
  });

  describe("setupRoutes", async () => {

    it("should set up the get route at /qr/:data", async () => {
      subject.setupRoutes();
      router.verify(r => r.get("/qr/:data", It.isAny()), Times.once());
    });
  });
  
  describe("getRouter", () => {
    it("should return the router", () => {
      assert.deepStrictEqual(subject.getRouter(), router.object);
    });
  });
});
