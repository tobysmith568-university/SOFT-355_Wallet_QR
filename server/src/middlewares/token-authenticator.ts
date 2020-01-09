import { Request, Response, NextFunction, Express } from "express";
import { ITokenService } from "../services/token.service.interface";

export class TokenAuthenticator {

  constructor(private readonly tokenService: ITokenService) {
  }

  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      
      const authToken = req.headers.authorization;
  
      if (authToken === undefined) {
        res.json({ error: "You are not authenticated" });
        res.statusCode = 401;
        return;
      }
  
      const parts = authToken.split(" ");
  
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.json({ error: "Your authorization header is not a bearer token" });
        res.statusCode = 401;
        return;
      }

      const tokenPayload = await this.tokenService.verify(parts[1]);

      if (tokenPayload === null) {
        res.json({ error: "Your token is invalid" });
        res.statusCode = 401;
        return;
      }

      if (typeof tokenPayload === "string") {
        res.json({ error: "Your token is invalid" });
        res.statusCode = 401;
        return;
      }
      
      const username = (tokenPayload as any).usr;

      if (username === undefined || username === null) {
        res.json({ error: "Your token is invalid" });
        res.statusCode = 401;
        return;
      }
  
      req.username = username;

      next();
    };
  }
}
