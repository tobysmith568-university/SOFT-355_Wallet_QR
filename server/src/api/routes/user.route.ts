import { Router } from "express";
import { IRoute } from "./route.interface";
import { UserController } from "../../contollers/user.controller";
import { TokenAuthenticator } from "../../middlewares/token-authenticator";

export class UserRoute implements IRoute {

  constructor(private readonly expressRouter: Router,
              private readonly controller: UserController,
              private readonly tokenMiddleware: TokenAuthenticator) {}

  public setupRoutes(): void {
    this.expressRouter.post("/user", this.controller.create);
    this.expressRouter.get("/user/:username", this.controller.getById);
    this.expressRouter.patch("/user/:username", this.tokenMiddleware.middleware(), this.controller.modify);
  }
  
  public getRouter(): Router {
    return this.expressRouter;
  }
}
