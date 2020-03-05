import { Router } from "express";
import { IRoute } from "./route.interface";
import { SearchController } from "../../contollers/search.controller";

export class SearchRoute implements IRoute {

  constructor(private expressRouter: Router,
              private controller: SearchController) {}
              
  setupRoutes(): void {
    this.expressRouter.get("/search/:term", this.controller.search);
  }

  getRouter(): Router {
    return this.expressRouter;
  }
}
