import { Request, Response } from "express";
import { UserRepository } from "../database/repositories/user.repository";
import { ISignIn } from "../api/models/signin.interface";
import { IPasswordService } from "../services/password.service.interface";
import { ITokenService } from "../services/token.service.interface";

export class SignInController {

  constructor(private userRepository: UserRepository,
              private passwordService: IPasswordService,
              private tokenService: ITokenService) { }

  public signIn = async (req: Request, res: Response) => {

    const request: ISignIn = req.body;

    const results = await this.userRepository.find({
      username: request.username
    });

    if (results.length === 0) {
      res.json({error: "Account not found"});
      return;
    }

    const user = results[0];

    const correctPassword = await this.passwordService.validate(request.password, user.passwordHash);

    if (!correctPassword) {
      res.json({error: "Incorrect password"});
      return;
    }
    
    res.json({token: await this.tokenService.create(user.username)});
  }
}
