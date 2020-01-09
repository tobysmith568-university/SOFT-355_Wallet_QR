import { Component, OnInit } from "@angular/core";
import { isNullOrUndefined } from "util";
import { UserApiService } from "src/app/services/api/user-api.service";
import { ICreateUser } from "src/app/models/createuser.interface";
import { IError } from "src/app/services/api/error.interface";
import { Router } from "@angular/router";
import { SignInApiService } from "src/app/services/api/signin-api.service";
import { IToken } from "src/app/models/token.interface";
import { PasswordAPIService } from "src/app/services/api/password-api.service";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignupComponent implements OnInit {

  formEnabled = true;
  matchNames = false;
  checkingPassword = false;
  knowTheRisks = false;

  usernameError = "";
  nameError = "";
  emailError = "";
  passwordError = "";
  timesBreached = 0;
  formError = "";

  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;

  constructor(private readonly userApiService: UserApiService,
              private readonly signInApiService: SignInApiService,
              private readonly passwordAPIService: PasswordAPIService,
              private readonly router: Router) { }

  ngOnInit() {
  }

  async usernameFocusOut() {
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

  nameFocusOut() {
    if (!this.matchNames && (isNullOrUndefined(this.name) || this.name.length === 0)) {
      this.nameError = "You need to either enter a name or check 'Same as username'";
      return;
    }

    this.nameError = "";
  }

  emailFocusOut() {
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

  async passwordFocusOut() {
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
      this.passwordError = "You need at least 1 punctuation";
      return;
    }

    this.checkingPassword = true;

    this.timesBreached = await this.passwordAPIService.checkPassword(this.password);

    this.checkingPassword = false;
    this.passwordError = "";
  }

  matchingPasswords(): boolean {
    return this.password === this.confirmPassword;
  }

  async signup() {
    await this.usernameFocusOut();
    this.nameFocusOut();
    this.emailFocusOut();
    await this.passwordFocusOut();

    if (this.usernameError
     || this.nameError
     || this.emailError
     || this.passwordError
     || !this.matchingPasswords()
     || this.checkingPassword
     || (this.timesBreached && !this.knowTheRisks)) {
       return;
    }

    const name = this.matchNames ? this.username : this.name;

    const createResult = await this.userApiService.createUser(this.username, name, this.email, this.password);

    if (this.isError(createResult)) {
      this.formError = createResult.error;
      return;
    }

    const signInResult = await this.signInApiService.signIn({
      username: this.username,
      password: this.password
    });

    if (this.isError(signInResult)) {
      this.formError = signInResult.error;
      return;
    }

    this.router.navigate(["@" + createResult.username]);
  }

  isError(result: IToken | ICreateUser | IError): result is IError {
    return (result as IError).error !== undefined;
  }
}
