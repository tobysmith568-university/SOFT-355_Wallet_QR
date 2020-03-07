import * as express from "express";
import * as cors from "cors";
import { Config } from "./config/config";
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
import { IEmailService } from "./services/email.service";
import { NodemailerEmailService } from "./services/implementations/nodemailer-email.service";
import { IFileService } from "./services/file.service.interface";
import { FSFileService } from "./services/implementations/fs-file.service";
import { VerifyRoute } from "./api/routes/verify.route";
import { VerifyController } from "./contollers/verify.controller";
import { SearchRoute } from "./api/routes/search.route";
import { SearchController } from "./contollers/search.controller";
import { WalletRoute } from "./api/routes/wallet.route";
import { WalletController } from "./contollers/wallet.controller";

export class Server {

  private config: Config;
  private app: Express;
  private httpServer: HTTPServer;

  private userRepository: UserRepository;
  private passwordService: IPasswordService;
  private tokenService: ITokenService;
  private emailService: IEmailService;
  private fileService: IFileService;

  private tokenMiddleware: TokenAuthenticator;

  constructor() {

    this.config = new Config();
    this.app = express();
    this.httpServer = new HTTPServer(this.app);

    this.userRepository = new UserRepository();
    this.passwordService = new BcryptPasswordService();
    this.tokenService = new JWTTokenService(this.config);
    this.emailService = new NodemailerEmailService(this.config);
    this.fileService = new FSFileService();

    this.tokenMiddleware = new TokenAuthenticator(this.tokenService);
  }

  public initializeMiddlewares() {
    this.app.use(express.json());

    this.app.use(cors({
      allowedHeaders: [
        "Authorization",
        "Content-Type"
      ]
    }));
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
        this.passwordService,
        this.emailService,
        this.tokenService,
        this.config,
        this.fileService
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

    const verifyRoute = new VerifyRoute(
      Router(),
      new VerifyController(
        this.tokenService,
        this.userRepository,
        this.config
      )
    );

    const searchRoute = new SearchRoute(
      Router(),
      new SearchController(
        this.userRepository
      )
    );

    const walletRoute = new WalletRoute(
      Router(),
      new WalletController(
        this.userRepository
      ),
      this.tokenMiddleware
    );

    userRoute.setupRoutes();
    signinRoute.setupRoutes();
    verifyRoute.setupRoutes();
    searchRoute.setupRoutes();
    walletRoute.setupRoutes();

    this.app.use("/v1", [
      userRoute.getRouter(),
      signinRoute.getRouter(),
      searchRoute.getRouter(),
      walletRoute.getRouter(),
      verifyRoute.getRouter()
    ]);
  }

  public listen(): void {
    this.httpServer.listen(this.config.getPort(), () => {
      console.log(`server started at port ${this.config.getPort()}`);
    });
  }
}
