import { Router } from "express";
import { IRoute } from "./route.interface";
import { SignInController } from "../../contollers/signin.controller";

export class SignInRoute implements IRoute {

  constructor(private expressRouter: Router,
              private controller: SignInController) {}

  public setupRoutes(): void {
  }
  
  public getRouter(): Router {
    throw new Error();
  }
}
