import { Schema, Document } from "mongoose";
import { IWalletDbo, WalletSchema } from "./wallet.dbo.interface";

export interface IUserDbo extends Document {
  username: string;
  email: string;
  displayName: string;
  passwordHash: string;
  wallets: IWalletDbo[];
  emailVerified: boolean;
}

export const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: false },
  displayName: { type: String, required: true, unique: false },
  passwordHash: { type: String, required: true, unique: false },
  wallets: { type: [WalletSchema], required: true, unique: false },
  emailVerified: { type: Boolean, required: true, unique: false }
});
