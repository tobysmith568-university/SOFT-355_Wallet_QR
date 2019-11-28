import { Request, Response } from "express";
import IHelloWorld from "../api/models/helloWorld";

export let controller = {

  get: (req: Request, res: Response) => {
    
    const result: IHelloWorld = {
      result: "This is a default result"
    };
    
    res.json(result);
  },

  getById: (req: Request, res: Response) => {
    
    const result: IHelloWorld = {
      result: `This is a result of : ${req.params.id}`
    };
    
    res.json(result);
  },
};
