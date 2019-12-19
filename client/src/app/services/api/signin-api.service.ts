import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { IError } from "./error.interface";
import { IToken } from "src/app/models/token.interface";
import { ISignInRequest } from "src/app/models/signin-request.interface";
import { StorageService } from "../storage.service";

@Injectable({
  providedIn: "root"
})
export class SignInApiService {

  constructor(private readonly apiService: ApiService,
              private readonly storageService: StorageService) { }

  public async signIn(request: ISignInRequest): Promise<IToken | IError> {
    const result = await this.apiService.post<IToken>("/signin", request);

    if (!this.isError(result)) {
      this.storageService.setLocal("token", result.token);
      this.storageService.setLocal("username", result.username);
    }

    return result;
  }

  private isError(result: IToken | IError): result is IError {
    return (result as IError).error !== undefined;
  }
}
