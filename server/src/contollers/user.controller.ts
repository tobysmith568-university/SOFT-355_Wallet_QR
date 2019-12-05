import { Request, Response } from "express";
import { UserRepository } from "../database/repositories/user.repository";
import { IUser } from "../api/models/user.interface";
import { IUserDbo } from "../database/models/user.dbo.interface";
import { MongoError } from "mongodb";
import { IPasswordService } from "../services/password.service.interface";

export class UserController {

  constructor(private readonly userRepository: UserRepository,
              private readonly passwordService: IPasswordService) {}

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
      passwordHash: await this.passwordService.hash(body.password)
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

    await user.save();

    res.statusCode = 201;
    res.send();
  }
}
