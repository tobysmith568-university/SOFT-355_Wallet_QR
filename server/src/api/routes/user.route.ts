import { Router } from "express";
import { IRoute } from "./route.interface";
import { UserController } from "../../contollers/user.controller";

export class UserRoute implements IRoute {

  constructor(private expressRouter: Router,
              private controller: UserController) {}

  public setupRoutes(): void {
    this.expressRouter.get("/users/:username", this.controller.getById);
  }
  
  public getRouter(): Router {
    return this.expressRouter;
  }
}
