import { Request, Response } from "express";
import { UserRepository } from "../database/repositories/user.repository";
import { IUser } from "../api/models/user.interface";

export class UserController {

  constructor(private userRepository: UserRepository) {}

  public getById = async (req: Request, res: Response) => {
  }
}
