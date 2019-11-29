import { Schema, Document } from "mongoose";
import { IUser } from "../../api/models/user.interface";

export interface IUserDbo extends IUser, Document {
  
}

export const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: false },
  passwordHash: { type: String, required: true, unique: false },
  name: { type: String, required: true, unique: false }
});
