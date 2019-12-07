import { Router } from "express";
import { IRoute } from "./route.interface";
import { QRController } from "../../contollers/qr.controller";

export class QRRoute implements IRoute {

  constructor(private expressRouter: Router,
              private controller: QRController) {}

  public setupRoutes(): void {
    this.expressRouter.get("/qr/:data", this.controller.get);
  }
  
  public getRouter(): Router {
    return this.expressRouter;
  }
}
