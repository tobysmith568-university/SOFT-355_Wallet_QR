import { Router } from "express";
import { IRoute } from "./route.interface";
import { TokenAuthenticator } from "../../middlewares/token-authenticator";
import { WalletController } from "../../contollers/wallet.controller";

export class WalletRoute implements IRoute {

  constructor(private readonly expressRouter: Router,
              private readonly controller: WalletController,
              private readonly tokenMiddleware: TokenAuthenticator) {}

  public setupRoutes(): void {
    this.expressRouter.post("/wallet", this.tokenMiddleware.middleware(), this.controller.create);
  }
  
  public getRouter(): Router {
    return this.expressRouter;
  }
}
