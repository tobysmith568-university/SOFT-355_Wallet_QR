import { model } from "mongoose";
import { Repository } from "./abstract.repository";
import { UserSchema, IUserDbo } from "../models/user.dbo.interface";

export class UserRepository extends Repository<IUserDbo> {
  constructor() {
    super(model<IUserDbo>("User", UserSchema));
  }
}
