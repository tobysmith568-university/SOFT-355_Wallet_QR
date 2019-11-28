import AbstractConfig from "./config.abstract";
import { ENV } from "./config";

export default class DevConfig extends AbstractConfig {
  constructor() {
    super();
    this.environment = ENV.dev;
    this.port = 8000;
    this.connectionString = process.env.DB_STRING_DEV;
  }
}
