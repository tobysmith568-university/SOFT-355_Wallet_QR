import AbstractConfig from "./config.abstract";
import { ENV } from "./config";

export default class DevConfig extends AbstractConfig {
  constructor() {
    super();
    this.environment = ENV.dev;
    this.port = 8000;
    this.connectionString = process.env.DB_STRING_DEV;
    this.tokenSecret = process.env.TOKEN_SECRET_DEV;

    this.emailHost = process.env.EMAIL_HOST;
    this.emailPort = Number(process.env.EMAIL_PORT);
    this.emailUser = process.env.EMAIL_USER;
    this.emailPass = process.env.EMAIL_PASS;
  }
}
