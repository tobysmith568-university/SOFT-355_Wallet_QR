import { Request, Response, NextFunction, Express } from "express";
import { json } from "body-parser";

export function bodyParser(app: Express) {
  return (req: Request, res: Response, next: NextFunction) => {
    app.use(json());
    next();
  };
}
