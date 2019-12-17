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

  public async getExternal(path: string): Promise<string> {
    return await this.httpClient.get(path, {
      observe: "body",
      responseType: "text"
    }).toPromise();
  }

  public async post<T>(path: string, body: any): Promise<T | IError> {
    return await this.httpClient.post<T | IError>(this.server + path, body).toPromise();
  }

  public async head(path: string): Promise<boolean> {
    try {
      const result = await this.httpClient.head(this.server + path, {
        observe: "response"
      }).toPromise();

      if (result.status === 200) {
        return true;
      }

      return false;
    } catch (e) {
      if (e.name === "HttpErrorResponse" && e.status === 404) {
        return false;
      }

      throw e;
    }
  }
}
