import { Component, OnInit, Input } from "@angular/core";
import { SignInApiService } from "src/app/services/api/signin-api.service";
import { IToken } from "src/app/models/token.interface";
import { IError } from "src/app/services/api/error.interface";

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

  constructor(private readonly signInService: SignInApiService) { }

  ngOnInit() {
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
  }

  private isError(result: IToken | IError): result is IError {
    return (result as IError).error !== undefined;
  }
}
