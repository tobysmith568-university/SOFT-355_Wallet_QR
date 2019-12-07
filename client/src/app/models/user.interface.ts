import { IWallet } from "./wallet.interface";

export interface IUser {
  username: string;
  email: string;
  name: string;
  wallets: IWallet[];
}
