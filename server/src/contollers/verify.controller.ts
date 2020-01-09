import { Request, Response } from "express";
import { ITokenService } from "../services/token.service.interface";
import { UserRepository } from "../database/repositories/user.repository";

export class VerifyController {

  private static readonly BASE64: string = "base64";
  private static readonly ASCII: string = "ascii";

  constructor(private readonly tokenService: ITokenService,
              private readonly userRepository: UserRepository) { }

  public verify = async (req: Request, res: Response) => {

    const base64Token = req.params.token;

    if (base64Token === null || base64Token === undefined) {
      res.statusCode = 401;
      res.send("<h1>The URL is missing a token!</h1>");
      return;
    }

    const token = Buffer.from(base64Token, VerifyController.BASE64).toString(VerifyController.ASCII);
    const payload = await this.tokenService.verify(token);

    if (payload === null || payload === undefined) {
      res.statusCode = 401;
      res.send("<h1>The given token is invalid</h1>");
      return;
    }

    if (typeof payload === "string") {
      res.statusCode = 401;
      res.send("<h1>The given token is an invalid type</h1>");
      return;
    }

    const payloadAsAny = payload as any;

    if (!payloadAsAny.usr) {
      res.statusCode = 401;
      res.send("<h1>The given token is not assigned to a user</h1>");
      return;
    }

    if (!payloadAsAny.use || payloadAsAny.use !== "activation") {
      res.statusCode = 401;
      res.send("<h1>The given token is not for this use</h1>");
      return;
    }

    const username: string = payloadAsAny.usr;

    const users = await this.userRepository.find({ username: username });

    if (users.length === 0) {
      res.send("<h1>This account no longer exists</h1>");
      res.statusCode = 401;
      return;
    }

    const user = users[0];

    user.emailVerified = true;

    await user.save();

    res.redirect("http://localhost:4200/@" + username);
  }
}
