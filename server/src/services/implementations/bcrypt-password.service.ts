import { IPasswordService } from "../password.service";
import { hash, compare } from "bcrypt";

export class BcryptPasswordService implements IPasswordService {

  private static readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return hash(password, BcryptPasswordService.saltRounds);
  }

  async validate(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  }
}
