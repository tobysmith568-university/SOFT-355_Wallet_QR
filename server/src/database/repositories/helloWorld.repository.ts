import { model } from "mongoose";
import { Repository } from "./abstract.repository";
import { IHelloWorld, HelloWorldSchema } from "../models/helloWorld";

export class HelloWorldRepository extends Repository<IHelloWorld> {
  constructor() {
    super(model<IHelloWorld>("HelloWorld", HelloWorldSchema));
  }
}
