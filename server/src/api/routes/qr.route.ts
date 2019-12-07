import { Router } from "express";
import { IRoute } from "./route.interface";

export class QRRoute implements IRoute {

  constructor() {}

  public setupRoutes(): void {
  }
  
  public getRouter(): Router {
    throw Error();
  }
}
