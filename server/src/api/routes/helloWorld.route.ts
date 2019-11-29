import { Router } from "express";
import { HelloWorldController } from "../../contollers/helloWorld.controller";
import { IRoute } from "./route.interface";

export class HelloWorldRoute implements IRoute {
  private readonly expressRouter: Router;

  constructor(private controller: HelloWorldController) {
    this.expressRouter = Router();
  }

  setupRoutes(): void {
    this.expressRouter.route("/")
      .get(this.controller.get);

    this.expressRouter.route("/:id")
      .get(this.controller.getById);
  }
  
  getRouter(): Router {
    return this.expressRouter;
  }
}
