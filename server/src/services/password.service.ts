export interface IPasswordService {
  hash(password: string): string;
  validate(password: string, hash: string): boolean;
}
