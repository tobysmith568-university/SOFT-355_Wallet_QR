export interface IPasswordService {
  hash(password: string): Promise<string>;
  validate(password: string, hash: string): Promise<boolean>;
}
