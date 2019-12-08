import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { IError } from "./error.interface";

@Injectable({
  providedIn: "root"
})
export class ApiService {

  private readonly server = "http://localhost:8000/api";

  constructor(private readonly httpClient: HttpClient) { }

  public async get<T>(path: string): Promise<T | IError> {
    return await this.httpClient.get<T | IError>(this.server + path).toPromise();
  }
}
