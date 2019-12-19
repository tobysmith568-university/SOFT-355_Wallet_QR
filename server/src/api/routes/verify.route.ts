import { IRoute } from "./route.interface";
import { Router } from "express";
import { VerifyController } from "../../contollers/verify.controller";

export class VerifyRoute implements IRoute {

  constructor(private readonly expressRouter: Router,
              private readonly controller: VerifyController) { }
  
  setupRoutes(): void {
    throw new Error("Method not implemented.");
  }
  
  getRouter(): Router {
    throw new Error("Method not implemented.");
  }
}
