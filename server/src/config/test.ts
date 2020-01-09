import { AbstractConfig } from "./config.abstract";
import { ENV } from "./config";

export class TestConfig extends AbstractConfig {
  constructor() {
    super();
    this.environment = ENV.test;
    this.port = 8000;
    this.connectionString = process.env.DB_STRING_TEST;
  }
}
