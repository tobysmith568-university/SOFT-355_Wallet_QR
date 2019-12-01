import { Router } from "express";
import { IRoute } from "./route.interface";
import { UserController } from "../../contollers/user.controller";

export class UserRoute implements IRoute {

  constructor(private expressRouter: Router,
              private controller: UserController) {}

  public setupRoutes(): void {
    this.expressRouter.get("/user/:username", this.controller.getById);

    this.expressRouter.post("/user", this.controller.create);
  }
  
  public getRouter(): Router {
    return this.expressRouter;
  }
}
