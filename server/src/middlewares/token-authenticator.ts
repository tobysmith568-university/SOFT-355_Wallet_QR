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

      const username = await this.tokenService.verify(parts[1]);

      if (username === null) {
        res.json({ error: "Your token is invalid" });
        res.statusCode = 401;
        return;
      }

      req.username = username;
  
      next();
    };
  }
}
