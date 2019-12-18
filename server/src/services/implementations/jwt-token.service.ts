import { sign, verify } from "jsonwebtoken";
import { ITokenService } from "../token.service.interface";
import { Config } from "../../config/config";

export class JWTTokenService implements ITokenService {

  private static readonly hashFunction = "HS256";

  constructor(private readonly config: Config) {}

  async create(username: string, expiresIn: string | number, extraFields?: Map<string, string>): Promise<string> {

    const payload = {
      usr: username
    } as any;

    if (extraFields) {
      for (const key of extraFields.keys()) {
        payload[key] = extraFields.get(key);
      }
    }

    const result = sign(payload, this.config.getTokenSecret(), {
      algorithm: JWTTokenService.hashFunction,
      expiresIn: expiresIn,
    });

    return result;
  }
  
  async verify(token: string): Promise<string | object | null> {
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
