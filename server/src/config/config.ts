import dev from "./dev";
import prod from "./prod";
import test from "./test";
import AbstractConfig from "./config.abstract";

export const ENV = {
  dev: "dev",
  prod: "prod",
  test: "test"
};

export class Config {

  private configs: { [id: string]: AbstractConfig; } = {
    dev: new dev(),
    prod: new prod(),
    test: new test()
  };

  private environment: string;
  private port: number;
  private connectionString: string;
  private tokenSecret: string;

  private emailHost: string;
  private emailPort: number;
  private emailUser: string;
  private emailPass: string;

  constructor() {
    this.environment = process.env.NODE_ENV || ENV.dev;
    
    const env = this.configs[this.environment];
    
    this.port = this.getOrThrow(env.port);
    this.connectionString = this.getOrThrow(env.connectionString);
    this.tokenSecret = this.getOrThrow(env.tokenSecret);

    this.emailHost = this.getOrThrow(env.emailHost);
    this.emailPort = this.getOrThrow(env.emailPort);
    this.emailUser = this.getOrThrow(env.emailUser);
    this.emailPass = this.getOrThrow(env.emailPass);
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

  public getTokenSecret(): string {
    return this.tokenSecret;
  }

  public getEmailHost(): string {
    return this.emailHost;
  }

  public getEmailPort(): number {
    return this.emailPort;
  }

  public getEmailUser(): string {
    return this.emailUser;
  }

  public getEmailPass(): string {
    return this.emailPass;
  }

  private getOrThrow<T>(data: T | null | undefined): T {
    
    if (data === null || data === undefined) {
      throw new Error("Required config is null or undefined");
    }

    return data;
  }
}
