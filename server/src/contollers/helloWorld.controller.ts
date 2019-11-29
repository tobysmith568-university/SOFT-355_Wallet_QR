import { Request, Response } from "express";
import IHelloWorld from "../api/models/helloWorld";

export class HelloWorldController {
  
  public get = (req: Request, res: Response) => {
    
    const result: IHelloWorld = {
      result: "This is a default result"
    };
    
    res.json(result);
  }

  public getById = (req: Request, res: Response) => {
    
    const result: IHelloWorld = {
      result: `This is a result of : ${req.params.id}`
    };
    
    res.json(result);
  }
}
