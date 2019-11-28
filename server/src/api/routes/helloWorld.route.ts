import { Router } from "express";
import { controller } from "../../contollers/helloWorld.controller";

const helloWorld = Router();

helloWorld.route("/")
  .get(controller.get);

  helloWorld.route("/:id")
  .get(controller.getById);

export default helloWorld;
