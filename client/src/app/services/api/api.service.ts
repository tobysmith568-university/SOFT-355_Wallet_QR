import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class ApiService {

  private readonly server = "http://localhost:8000/api";

  constructor(private readonly httpClient: HttpClient) { }

  public async get<T>(path: string): Promise<T> {
    return await this.httpClient.get<T>(this.server + path).toPromise();
  }
}
