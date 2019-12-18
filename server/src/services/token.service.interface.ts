export interface ITokenService {
  create(username: string, expiresIn: string | number, extraFields?: Map<string, string>): Promise<string>;
  verify(token: string): Promise<string | object | null>;
}
