import { model } from "mongoose";
import { Repository } from "./abstract.repository";
import { HelloWorldSchema, IHelloWorldDbo } from "../models/helloWorld";

export class HelloWorldRepository extends Repository<IHelloWorldDbo> {
  constructor() {
    super(model<IHelloWorldDbo>("HelloWorld", HelloWorldSchema));
  }
}
