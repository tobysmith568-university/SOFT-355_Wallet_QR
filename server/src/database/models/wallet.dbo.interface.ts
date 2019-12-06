import { Schema, Document } from "mongoose";

export interface IWalletDbo extends Document {
  name: string;
  currency: string;
  address: string;
}

export const WalletSchema: Schema = new Schema({
  name: { type: String, required: true, unique: false },
  currency: { type: String, required: true, unique: false },
  address: { type: String, required: true, unique: false }
});
