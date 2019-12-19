import { Request, Response } from "express";
import { ITokenService } from "../services/token.service.interface";
import { UserRepository } from "../database/repositories/user.repository";

export class VerifyController {

  constructor(private readonly tokenService: ITokenService,
              private readonly userRepository: UserRepository) { }

  public verify = async (req: Request, res: Response) => {

  }
}
