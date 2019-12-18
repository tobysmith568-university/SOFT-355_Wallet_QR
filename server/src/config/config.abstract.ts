export default abstract class AbstractConfig {
  public environment: string | undefined;
  public port: number | undefined;
  public connectionString: string | undefined;
  public tokenSecret: string | undefined;
  
  public emailHost: string | undefined;
  public emailPort: number | undefined;
  public emailUser: string | undefined;
  public emailPass: string | undefined;
}
