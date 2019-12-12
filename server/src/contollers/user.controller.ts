import { Request, Response } from "express";
import { UserRepository } from "../database/repositories/user.repository";
import { IUser } from "../api/models/user.interface";
import { IUserDbo } from "../database/models/user.dbo.interface";
import { MongoError } from "mongodb";
import { IPasswordService } from "../services/password.service.interface";
import { IWallet } from "../api/models/wallet.interface";

export class UserController {

  constructor(private readonly userRepository: UserRepository,
              private readonly passwordService: IPasswordService) {}

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
      name: searchResult.name,
      username: searchResult.username,
      email: searchResult.email,
      wallets: new Array<IWallet>()
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
      name: body.name,
      passwordHash: await this.passwordService.hash(body.password),
      wallets: body.wallets
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
      name: createdDbo.name,
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
    user.name = changes.name || user.name;
    user.wallets = changes.wallets || user.wallets;

    await user.save();

    res.statusCode = 204;
    res.send();
  }

  public exists = async (req: Request, res: Response) => {
  }
}
