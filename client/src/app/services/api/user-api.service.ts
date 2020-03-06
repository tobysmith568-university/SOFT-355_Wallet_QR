import { Injectable } from "@angular/core";
import { IUser } from "src/app/models/user.interface";
import { ApiService } from "./api.service";
import { IError } from "./error.interface";
import { ICreateUser } from "src/app/models/createuser.interface";
import { ISearchResult } from "src/app/models/search-result.interface";
import { IWallet } from "src/app/models/wallet.interface";

@Injectable({
  providedIn: "root"
})
export class UserApiService {

  constructor(private readonly apiService: ApiService) { }

  public async createUser(username: string, displayName: string, email: string, password: string): Promise<ICreateUser | IError> {
    return await this.apiService.post<ICreateUser>("/user", {
      username,
      displayName,
      email,
      password
    } as ICreateUser);
  }

  public async getUser(username: string): Promise<IUser | IError> {
    return await this.apiService.get("/user/" + username);
  }

  public async updateUser(username: string, user: Partial<IUser>): Promise<void> {
    await this.apiService.patch<ICreateUser>("/user/" + username, user);
  }

  public async userExists(username: string): Promise<boolean> {
    return await this.apiService.head("/user/" + username);
  }

  public async search(term: string): Promise<ISearchResult[]> {
    const result = await this.apiService.get<{
      results: ISearchResult[]
    }>("/search/" + term);

    if (this.isError(result)) {
      return [];
    }

    return result.results;
  }

  public async addWallet(wallet: IWallet): Promise<void> {
    await this.apiService.post("/wallet", wallet);
  }

  private isError(result: { results: ISearchResult[] } | IError): result is IError {
    return (result as IError).error !== undefined;
  }
}
