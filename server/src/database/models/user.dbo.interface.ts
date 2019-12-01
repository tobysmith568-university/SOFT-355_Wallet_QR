import { Schema, Document } from "mongoose";

export interface IUserDbo extends Document {
  username: string;
  email: string;
  name: string;
  passwordHash: string;
}

export const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: false },
  name: { type: String, required: true, unique: false },
  passwordHash: { type: String, required: true, unique: false }
});
