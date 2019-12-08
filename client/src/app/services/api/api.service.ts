import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { IError } from "./error.interface";

@Injectable({
  providedIn: "root"
})
export class ApiService {

  private readonly server = "http://localhost:8000/api";

  constructor(private readonly httpClient: HttpClient) { }

  public async get<T>(path: string): Promise<T | IError> {
    let headers = new HttpHeaders();

    if (localStorage.getItem("token")) {
      headers = headers.set("Authorization", localStorage.getItem("token"));
    }

    return await this.httpClient.get<T | IError>(this.server + path, {
      headers
    }).toPromise();
  }

  public async post<T>(path: string, body: any): Promise<T | IError> {
    return await this.httpClient.post<T | IError>(this.server + path, body).toPromise();
  }
}
