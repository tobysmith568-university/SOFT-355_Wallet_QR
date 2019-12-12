import { Component, OnInit } from "@angular/core";
import { isNullOrUndefined } from "util";
import { UserApiService } from "src/app/services/api/user-api.service";
import { ICreateUser } from "src/app/models/createuser.interface";
import { IError } from "src/app/services/api/error.interface";
import { Router } from "@angular/router";
import { SignInApiService } from "src/app/services/api/signin-api.service";
import { IToken } from "src/app/models/token.interface";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignupComponent implements OnInit {

  private formEnabled = true;
  private matchNames = false;

  private usernameError = "";
  private nameError = "";
  private emailError = "";
  private passwordError = "";

  private username: string;
  private name: string;
  private email: string;
  private password: string;
  private confirmPassword: string;

  constructor(private readonly userApiService: UserApiService,
              private readonly signInApiService: SignInApiService,
              private readonly router: Router) { }

  ngOnInit() {
  }

  private async usernameFocusOut() {
    if (isNullOrUndefined(this.username) || this.username.length === 0) {
      this.usernameError = "You need to enter a username";
      return;
    }

    if (!this.username.match(/^[a-zA-Z0-9]+$/)) {
      this.usernameError = "Usernames can only contains numbers and letters";
      return;
    }

    if (await this.userApiService.userExists(this.username)) {
      this.usernameError = "This username is not available";
      return;
    }

    this.usernameError = "";
  }

  private nameFocusOut() {
    if (!this.matchNames && (isNullOrUndefined(this.name) || this.name.length === 0)) {
      this.nameError = "You need to either enter a name or check 'Same as username'";
      return;
    }

    this.nameError = "";
  }

  private emailFocusOut() {
    if (isNullOrUndefined(this.email) || this.email.length === 0) {
      this.emailError = "You need to enter an email";
      return;
    }

    if (!this.email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)) {
      this.emailError = "You need to enter a valid email";
      return;
    }

    this.emailError = "";
  }

  private passwordFocusOut() {
    if (isNullOrUndefined(this.password) || this.password.length === 0) {
      this.passwordError = "You need to enter a password";
      return;
    }

    if (this.password.length < 8) {
      this.passwordError = "You need at least 8 characters";
      return;
    }

    if (!this.password.match(/^.*?[a-z]+.*?$/)) {
      this.passwordError = "You need at least 1 lowercase letter";
      return;
    }

    if (!this.password.match(/^.*?[A-Z]+.*?$/)) {
      this.passwordError = "You need at least 1 uppercase letter";
      return;
    }

    if (!this.password.match(/^.*?[0-9]+.*?$/)) {
      this.passwordError = "You need at least 1 number";
      return;
    }

    if (!this.password.match(/^.*?[!"£€$%^&*()\-=_+[\]{};':@,.<>/?\\|#~¬`]+.*?$/)) {
      this.passwordError = "You need at least 1 puncuation";
      return;
    }

    this.passwordError = "";
  }

  private matchingPasswords(): boolean {
    return this.password === this.confirmPassword;
  }

  private async signup() {
    await this.usernameFocusOut();
    this.nameFocusOut();
    this.emailFocusOut();
    this.passwordFocusOut();

    if (this.usernameError
     || this.nameError
     || this.emailError
     || this.passwordError
     || !this.matchingPasswords()) {
       return;
     }

    const createResult = await this.userApiService.createUser(this.username, this.name, this.email, this.password);

    if (this.isError(createResult)) {
      // Show form error
      return;
    }

    const signInResult = await this.signInApiService.signIn({
      username: this.username,
      password: this.password
    });

    if (this.isError(signInResult)) {
      // Show account error
      return;
    }

    this.router.navigate(["@" + createResult.username]);
  }

  private isError(result: IToken | ICreateUser | IError): result is IError {
    return (result as IError).error !== undefined;
  }
}
