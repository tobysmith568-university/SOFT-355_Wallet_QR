import { Request, Response, NextFunction, Express } from "express";

export class TokenAuthenticator {

  constructor() {
  }

  public middleware(app: Express) {
    return async (req: Request, res: Response, next: NextFunction) => {
    };
  }
}
