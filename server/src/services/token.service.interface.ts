export interface ITokenService {
  create(username: string): Promise<string>;
  verify(token: string): Promise<string | null>;
}
