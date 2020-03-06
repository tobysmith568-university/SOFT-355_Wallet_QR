import { Request, Response } from "express";
import { UserRepository } from "../database/repositories/user.repository";
import { IWalletDbo } from "../database/models/wallet.dbo.interface";

export class WalletController {

  constructor(private readonly userRepository: UserRepository) { }

  public create = async (req: Request, res: Response) => {

    if (req.username === undefined || req.username.length === 0) {
      res.json({ error: "You are not logged in" });
      res.statusCode = 401;
      return;
    }

    if (!req.body.address) {
      res.json({ error: "Wallet address was not given" });
      res.statusCode = 401;
      return;
    }

    if (!req.body.currency) {
      res.json({ error: "Wallet currency was not given" });
      res.statusCode = 401;
      return;
    }

    const users = await this.userRepository.find({ username: req.username });

    if (users.length !== 1) {
      res.json({ error: "This account no longer exists" });
      res.statusCode = 401;
      return;
    }

    const user = users[0];
    
    user.wallets.push({
      address: req.body.address,
      currency: req.body.currency,
      name: req.body.name ?? ""
    } as IWalletDbo);

    await user.save();

    res.statusCode = 201;
    res.send();
  }
}
