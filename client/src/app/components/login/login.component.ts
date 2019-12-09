import { Component, OnInit, Input } from "@angular/core";
import { SignInApiService } from "src/app/services/api/signin-api.service";
import { IToken } from "src/app/models/token.interface";
import { IError } from "src/app/services/api/error.interface";
import { Router } from "@angular/router";

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
              private readonly router: Router) { }

  ngOnInit() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

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
      return;
    }

    localStorage.setItem("token", result.token);
    localStorage.setItem("username", result.username);

    this.router.navigate(["@" + result.username]);
  }

  private isError(result: IToken | IError): result is IError {
    return (result as IError).error !== undefined;
  }
}
