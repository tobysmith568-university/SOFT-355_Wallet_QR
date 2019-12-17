import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
const sha1 = require("sha1");

@Injectable({
  providedIn: "root"
})
export class PasswordAPIService {

  constructor(private readonly apiService: ApiService) { }

  public async checkPassword(password: string): Promise<number> {
    const passwordSHA1: string = sha1(password).toUpperCase();
    const shaBegining = passwordSHA1.substr(0, 5);
    const shaRemaining = passwordSHA1.substr(5);

    const apiResult = await this.apiService.getExternal("https://api.pwnedpasswords.com/range/" + shaBegining);

    const lines = apiResult.split("\n");
    let times = 0;

    for (const line of lines) {
      if (line.slice(0, 35) === shaRemaining) {
        times = Number(line.slice(36));
        break;
      }
    }

    return times;
  }
}
