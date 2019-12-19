import { Request, Response } from "express";
import { UserRepository } from "../database/repositories/user.repository";
import { IUser } from "../api/models/user.interface";
import { IUserDbo } from "../database/models/user.dbo.interface";
import { MongoError } from "mongodb";
import { IPasswordService } from "../services/password.service.interface";
import { IWallet } from "../api/models/wallet.interface";
import { IEmailService } from "../services/email.service";
import { ITokenService } from "../services/token.service.interface";
import template = require("es6-template-strings");
import { IFileService } from "../services/file.service.interface";

export class UserController {

  private static readonly _24HOURS = "24 hours";
  private static readonly BASE64 = "base64";

  private welcomeEmail: string;

  constructor(private readonly userRepository: UserRepository,
              private readonly passwordService: IPasswordService,
              private readonly emailService: IEmailService,
              private readonly tokenService: ITokenService,
              fileService: IFileService) {

    this.welcomeEmail = fileService.readFile("./src/assets/emails/welcome-email.html");
  }

  public getById = async (req: Request, res: Response) => {
    
    const searchResults = await this.userRepository.find({
      username: req.params.username
    });

    if (searchResults.length === 0) {
      res.json({error: `@${req.params.username} does not exist :(`});
      return;
    }

    const searchResult = searchResults[0];

    const result = {
      displayName: searchResult.displayName,
      username: searchResult.username,
      wallets: new Array<IWallet>(),
      emailVerified: searchResult.emailVerified
    } as IUser;

    searchResult.wallets.forEach(wallet => result.wallets.push({
      address: wallet.address,
      currency: wallet.currency,
      name: wallet.name
    }));

    res.json(result);
  }

  public create = async (req: Request, res: Response) => {

    const body: IUser = req.body;

    const newDbo = {
      username: body.username,
      email: body.email,
      displayName: body.displayName,
      passwordHash: await this.passwordService.hash(body.password),
      wallets: body.wallets,
      emailVerified: false
    } as IUserDbo;

    body.password = "";
    req.body.password = "";

    let createdDbo: IUserDbo; 
    try {
      createdDbo = await this.userRepository.create(newDbo);
    } catch (e) {
      if (e instanceof MongoError) {
        switch (e.code) {
          case 11000:
            res.json({error: "This username has already been used"});
            return;
        }
      }

      res.json({error: `User could not be created: ${e}`});
      return;
    }
    
    const result = {
      displayName: createdDbo.displayName,
      username: createdDbo.username,
      email: createdDbo.email,
      wallets: new Array<IWallet>()
    } as IUser;
    
    createdDbo.wallets.forEach(wallet => {
      result.wallets.push({
        name: wallet.name,
        address: wallet.address,
        currency: wallet.currency
      } as IWallet);
    });
    
    const token = await this.tokenService.create(result.username, UserController._24HOURS, new Map([
      ["use", "activation"]
    ]));

    const tokenBase64 = Buffer.from(token).toString(UserController.BASE64);

    const completeEmail = template(this.welcomeEmail, {
      name: result.displayName,
      verifyURL: "http://localhost:8000/verify/" + tokenBase64
    });

    await this.emailService.sendHTMLEmail(result.email, "Welcome to WalletQR!", completeEmail);

    res.json(result);
  }

  public modify = async (req: Request, res: Response) => {

    if (req.username === undefined || req.username.length === 0) {
      res.json({ error: "You are not logged in" });
      res.statusCode = 401;
      return;
    }

    const username = req.params.username;

    if (username !== req.username) {
      res.json({ error: "You do not have permission to edit this user" });
      res.statusCode = 401;
      return;
    }

    const users = await this.userRepository.find({ username: username });

    if (users.length !== 1) {
      res.json({ error: "This account no longer exists" });
      res.statusCode = 401;
      return;
    }

    const user = users[0];
    const changes: Partial<IUserDbo> = req.body;

    user.email = changes.email || user.email;
    user.displayName = changes.displayName || user.displayName;

    if (user.emailVerified) {
      user.wallets = changes.wallets || user.wallets;
    }

    await user.save();

    res.statusCode = 204;
    res.send();
  }

  public exists = async (req: Request, res: Response) => {

    const searchResults = await this.userRepository.find({
      username: req.params.username
    });

    res.status(searchResults.length === 0 ? 404 : 200);
    res.send();
  }
}
