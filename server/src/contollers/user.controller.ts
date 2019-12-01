import { Request, Response } from "express";
import { UserRepository } from "../database/repositories/user.repository";
import { IUser } from "../api/models/user.interface";
import { IUserDbo } from "../database/models/user.dbo.interface";
import { MongoError } from "mongodb";
import { IPasswordService } from "../services/password.service";

export class UserController {

  constructor(private userRepository: UserRepository,
              private passwordService: IPasswordService) {}

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

    const body: IUser = req.body;
    
    const newDbo = {
      username: body.username,
      email: body.email,
      name: body.name,
      passwordHash: this.passwordService.hash(body.password)
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

    res.json({
      name: createdDbo.name,
      username: createdDbo.username,
      email: createdDbo.email
    } as IUser);
  }
}
