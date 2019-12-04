import { Request, Response } from "express";
import { ITokenService } from "../services/token.service.interface";
import { UserRepository } from "../database/repositories/user.repository";
import { IPasswordService } from "../services/password.service.interface";

export class SignInController {

  constructor(private userRepository: UserRepository,
              private passwordService: IPasswordService,
              private tokenService: ITokenService) { }

  public signIn = async (req: Request, res: Response) => {
  }
}
