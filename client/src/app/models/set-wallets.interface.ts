import { IWallet } from "./wallet.interface";

export interface ISetWallets {
  token: string;
  wallets: IWallet[];
}
