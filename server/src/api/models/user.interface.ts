import { IWallet } from "./wallet.interface";

export interface IUser {
  username: string;
  email: string;
  displayName: string;
  password: string;
  wallets: IWallet[];
  emailVerified: boolean;
}
