export interface ITokenService {
  create(username: string, expiresIn: string | number): Promise<string>;
  verify(token: string): Promise<string | null>;
}
