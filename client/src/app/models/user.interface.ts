import { IWallet } from "./wallet.interface";

export interface IUser {
  username: string;
  email: string;
  displayName: string;
  wallets: IWallet[];
  emailVerified: boolean;
}
