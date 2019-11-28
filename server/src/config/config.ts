import dev from "./dev";
import prod from "./prod";
import test from "./test";
import AbstractConfig from "./config.abstract";

export const ENV = {
  dev: "dev",
  prod: "prod",
  test: "test"
};

export default class Config {

  private configs: { [id: string]: AbstractConfig; } = {
    dev: new dev(),
    prod: new prod(),
    test: new test()
  };

  private environment: string;
  private port: number;
  private connectionString: string;

  constructor() {
    this.environment = process.env.NODE_ENV || ENV.dev;
    
    const env = this.configs[this.environment];
    
    this.port = env.port || 3000;
    this.connectionString = env.connectionString || "mongodb://localhost/devDB";
  }

  public getEnvironment(): string {
    return this.environment;
  }

  public getPort(): number {
    return this.port;
  }

  public getConnectionString(): string {
    return this.connectionString;
  }
}
