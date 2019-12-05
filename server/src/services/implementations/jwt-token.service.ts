import { ITokenService } from "../token.service.interface";
import { sign, verify } from "jsonwebtoken";
import Config from "../../config/config";

export class JWTTokenService implements ITokenService {

  private static readonly hashFunction = "HS256";
  private static readonly tokenLifetime = "14 days";

  constructor(private readonly config: Config) {}

  async create(username: string): Promise<string> {
    const result = sign({
      usr: username
    }, this.config.getTokenSecret(), {
      algorithm: JWTTokenService.hashFunction,
      expiresIn: JWTTokenService.tokenLifetime,
    });

    return result;
  }
  
  async verify(token: string): Promise<string | null> {
    try {
      const payload = verify(token, this.config.getTokenSecret());

      if (typeof payload === "string") {
        return payload;
      }

      return (payload as any).usr;
    } catch {
      return null;
    }
  }
}
