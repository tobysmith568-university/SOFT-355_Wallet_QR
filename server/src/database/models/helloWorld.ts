import { Schema, Document } from "mongoose";

export interface IHelloWorld extends Document {
  result: string;
}

export const HelloWorldSchema: Schema = new Schema({
  result: { type: String, required: true, unique: true }
});
