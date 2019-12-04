import { IPasswordService } from "../password.service";

export class BcryptPasswordService implements IPasswordService {

  async hash(password: string): Promise<string> {
    return "";
  }

  async validate(password: string, passwordHash: string): Promise<boolean> {
    return true;
  }
}
