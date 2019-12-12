import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { IError } from "./error.interface";
import { IToken } from "src/app/models/token.interface";
import { ISignInRequest } from "src/app/models/signin-request.interface";

@Injectable({
  providedIn: "root"
})
export class SignInApiService {

  constructor(private readonly apiService: ApiService) { }

  public async signIn(request: ISignInRequest): Promise<IToken | IError> {
    const result = await this.apiService.post<IToken>("/signin", request);

    if (!this.isError(result)) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);
    }

    return result;
  }

  private isError(result: IToken | IError): result is IError {
    return (result as IError).error !== undefined;
  }
}
