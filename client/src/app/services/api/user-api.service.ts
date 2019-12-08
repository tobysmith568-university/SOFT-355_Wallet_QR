import { Injectable } from "@angular/core";
import { IUser } from "src/app/models/user.interface";
import { ApiService } from "./api.service";
import { IError } from "./error.interface";

@Injectable({
  providedIn: "root"
})
export class UserApiService {

  constructor(private readonly apiService: ApiService) { }

  public async getUser(username: string): Promise<IUser | IError> {
    return await this.apiService.get("/user/" + username);
  }
}
