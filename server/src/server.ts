import * as express from "express";
import Config from "./config/config";
import { ENV } from "./config/config";
import { join } from "path";
import { bodyParser } from "./middlewares/bodyParser";
import { connect } from "mongoose";
import { Express, Router } from "express";
import { MongoError } from "mongodb";
import { UserRoute } from "./api/routes/user.route";
import { UserController } from "./contollers/user.controller";
import { UserRepository } from "./database/repositories/user.repository";

export default class Server {

  constructor(private app: Express, private config: Config) {
    
    if (config.getEnvironment() === ENV.prod) {
      this.app.use(express.static(join(__dirname, "../../../../client/dist")));
    }
  }

  public initializeMiddlewares() {
    this.app.use(bodyParser(this.app));
  }

  public setUpDatabaseConnection() {
    connect(this.config.getConnectionString(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }, (err: MongoError) => {
      if (!err) {
        console.log("Connected to DB");
        return;
      }

      console.log("Failed to connect to DB with errors: " + err);
    });
  }

  public initializeControllers() {
    
    const helloWorldRoute = new UserRoute(
      Router(),
      new UserController(
        new UserRepository()
      )
    );

    helloWorldRoute.setupRoutes();

    this.app.use("/api", helloWorldRoute.getRouter());
  }

  public listen(): void {
    this.app.listen(this.config.getPort(), () => {
      console.log(`server started at port ${this.config.getPort()}`);
    });
  }
}
