import { Request, Response } from "express";
import { IHelloWorld } from "../api/models/helloWorld";
import { HelloWorldRepository } from "../database/repositories/helloWorld.repository";

export class HelloWorldController {

  constructor(private helloWorldRepository: HelloWorldRepository) {

  }
  
  public get = async (req: Request, res: Response) => {
    
    const model: IHelloWorld = {
      result: "This is a default result"
    };

    await this.helloWorldRepository.save(model);
    
    res.json(model);
  }

  public getById = async (req: Request, res: Response) => {
    
    const model: IHelloWorld = {
      result: `This is a result of : ${req.params.id}`
    };

    await this.helloWorldRepository.save(model);
    
    res.json(model);
  }
}
