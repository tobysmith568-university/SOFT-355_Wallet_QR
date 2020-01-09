import { Component, OnInit, Input } from "@angular/core";
import { SignInApiService } from "src/app/services/api/signin-api.service";
import { IToken } from "src/app/models/token.interface";
import { IError } from "src/app/services/api/error.interface";
import { Router } from "@angular/router";
import { StorageService } from "src/app/services/storage.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {

  username = "";
  password = "";
  message = "";

  formEnabled = true;

  constructor(private readonly signInService: SignInApiService,
              private readonly router: Router,
              private readonly storageService: StorageService) { }

  ngOnInit() {
    const token = this.storageService.get("token");
    const username = this.storageService.get("username");

    if (token && username) {
      this.router.navigate(["@" + username]);
    } else if (token) {
      this.router.navigate([""]);
    }
  }

  async login() {
    this.formEnabled = false;

    const result = await this.signInService.signIn({
      username: this.username,
      password: this.password
    });

    if (this.isError(result)) {
      this.message = result.error;
      this.formEnabled = true;
      return;
    }

    this.router.navigate(["@" + result.username]);
  }

  private isError(result: IToken | IError): result is IError {
    return (result as IError).error !== undefined;
  }
}
