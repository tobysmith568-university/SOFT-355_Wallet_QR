import { Schema, Document } from "mongoose";
import { IHelloWorld } from "../../api/models/helloWorld";

export interface IHelloWorldDbo extends IHelloWorld, Document {
  
}

export const HelloWorldSchema: Schema = new Schema({
  result: { type: String, required: true, unique: false }
});
