export class Config {
  private port: number;
  private connectionString: string;
  private tokenSecret: string;

  private emailHost: string;
  private emailPort: number;
  private emailUser: string;
  private emailPass: string;

  private clientLocation: string;
  private serverLocation: string;

  constructor() {
    this.port = Number(this.getOrThrow(process.env.PORT || "3000"));
    this.connectionString = this.getOrThrow(process.env.DB_STRING);
    this.tokenSecret = this.getOrThrow(process.env.TOKEN_SECRET);

    this.emailHost = this.getOrThrow(process.env.EMAIL_HOST);
    this.emailPort = Number(this.getOrThrow(process.env.EMAIL_PORT));
    this.emailUser = this.getOrThrow(process.env.EMAIL_USER);
    this.emailPass = this.getOrThrow(process.env.EMAIL_PASS);

    this.clientLocation = this.getOrThrow(process.env.CLIENT_LOCATION);
    this.serverLocation = this.getOrThrow(process.env.SERVER_LOCATION);
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

  public getClientLocation(): string {
    return this.clientLocation;
  }

  public getServerLocation(): string {
    return this.serverLocation;
  }

  private getOrThrow<T>(data: T | null | undefined): T {
    
    if (data === null || data === undefined) {
      throw new Error("Required config is null or undefined");
    }

    return data;
  }
}
