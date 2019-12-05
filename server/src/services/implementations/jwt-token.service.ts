import { ITokenService } from "../token.service.interface";

export class JWTTokenService implements ITokenService {

  constructor() {}

  async create(username: string): Promise<string> {
    return "";
  }
  
  async verify(token: string): Promise<string | null> {
    return null;
  }
}
