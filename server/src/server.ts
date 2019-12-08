import * as express from "express";
import * as cors from "cors";
import Config from "./config/config";
import { ENV } from "./config/config";
import { join } from "path";
import { connect } from "mongoose";
import { Express, Router } from "express";
import { MongoError } from "mongodb";
import { UserRoute } from "./api/routes/user.route";
import { UserController } from "./contollers/user.controller";
import { UserRepository } from "./database/repositories/user.repository";
import { BcryptPasswordService } from "./services/implementations/bcrypt-password.service";
import { SignInRoute } from "./api/routes/signin.route";
import { SignInController } from "./contollers/signin.controller";
import { JWTTokenService } from "./services/implementations/jwt-token.service";
import { TokenAuthenticator } from "./middlewares/token-authenticator";

export default class Server {

  constructor(private app: Express, private config: Config) {
    
    if (config.getEnvironment() === ENV.prod) {
      this.app.use(express.static(join(__dirname, "../../../../client/dist")));
    }
  }

  public initializeMiddlewares() {
    this.app.use(express.json());

    if (this.config.getEnvironment() !== ENV.prod) {
      this.app.use(cors({
        allowedHeaders: [
          "Authorization"
        ]
      }));
    }
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

    const userRepository = new UserRepository();
    const passwordService = new BcryptPasswordService();
    const tokenService = new JWTTokenService(this.config);

    const tokenMiddleware = new TokenAuthenticator(tokenService);
    
    const userRoute = new UserRoute(
      Router(),
      new UserController(
        userRepository,
        passwordService
      ),
      tokenMiddleware
    );

    const signinRoute = new SignInRoute(
      Router(),
      new SignInController(
        userRepository,
        passwordService,
        tokenService
      )
    );

    userRoute.setupRoutes();
    signinRoute.setupRoutes();

    this.app.use("/api", [
      userRoute.getRouter(),
      signinRoute.getRouter()  
    ]);
  }

  public listen(): void {
    this.app.listen(this.config.getPort(), () => {
      console.log(`server started at port ${this.config.getPort()}`);
    });
  }
}
