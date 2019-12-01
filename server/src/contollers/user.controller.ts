import { Request, Response } from "express";
import { UserRepository } from "../database/repositories/user.repository";
import { IUser } from "../api/models/user.interface";

export class UserController {

  constructor(private userRepository: UserRepository) {}

  public getById = async (req: Request, res: Response) => {
    
    const results = await this.userRepository.find({
      username: req.params.username
    });

    if (results.length === 0) {
      res.json({error: "User could not be found"});
      return;
    }

    const result = results[0];

    res.json({
      name: result.name,
      username: result.username,
      email: result.email
    } as IUser);
  }

  public create = async (req: Request, res: Response) => {
  }
}
