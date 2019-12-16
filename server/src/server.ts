import * as express from "express";
import * as cors from "cors";
import * as socketio from "socket.io";
import { Config } from "./config/config";
import { ENV } from "./config/config";
import { join } from "path";
import { connect } from "mongoose";
import { Express, Router } from "express";
import { Server as HTTPServer } from "http";
import { MongoError } from "mongodb";
import { UserRoute } from "./api/routes/user.route";
import { UserController } from "./contollers/user.controller";
import { UserRepository } from "./database/repositories/user.repository";
import { BcryptPasswordService } from "./services/implementations/bcrypt-password.service";
import { SignInRoute } from "./api/routes/signin.route";
import { SignInController } from "./contollers/signin.controller";
import { JWTTokenService } from "./services/implementations/jwt-token.service";
import { TokenAuthenticator } from "./middlewares/token-authenticator";
import { IPasswordService } from "./services/password.service.interface";
import { ITokenService } from "./services/token.service.interface";
import { SetWallets } from "./websockets/set-wallets";
import { SearchUsers } from "./websockets/search-users";

export class Server {

  private config: Config;
  private app: Express;
  private httpServer: HTTPServer;
  private io: socketio.Server;

  private userRepository: UserRepository;
  private passwordService: IPasswordService;
  private tokenService: ITokenService;

  private tokenMiddleware: TokenAuthenticator;

  constructor() {

    this.config = new Config();
    this.app = express();
    this.httpServer = new HTTPServer(this.app);
    this.io = socketio(this.httpServer);

    this.userRepository = new UserRepository();
    this.passwordService = new BcryptPasswordService();
    this.tokenService = new JWTTokenService(this.config);

    this.tokenMiddleware = new TokenAuthenticator(this.tokenService);

    if (this.config.getEnvironment() === ENV.prod) {
      this.app.use(express.static(join(__dirname, "../../../../client/dist")));
    }
  }

  public initializeMiddlewares() {
    this.app.use(express.json());

    if (this.config.getEnvironment() !== ENV.prod) {
      this.app.use(cors({
        allowedHeaders: [
          "Authorization",
          "Content-Type"
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

    const userRoute = new UserRoute(
      Router(),
      new UserController(
        this.userRepository,
        this.passwordService
      ),
      this.tokenMiddleware
    );

    const signinRoute = new SignInRoute(
      Router(),
      new SignInController(
        this.userRepository,
        this.passwordService,
        this.tokenService
      )
    );

    userRoute.setupRoutes();
    signinRoute.setupRoutes();

    this.app.use("/api", [
      userRoute.getRouter(),
      signinRoute.getRouter()
    ]);
  }

  public initializeWebsockets() {
    new SetWallets(this.io, this.tokenService, this.userRepository).setup();
    new SearchUsers(this.io, this.userRepository).setup();
  }

  public listen(): void {
    this.httpServer.listen(this.config.getPort(), () => {
      console.log(`server started at port ${this.config.getPort()}`);
    });
  }
}
