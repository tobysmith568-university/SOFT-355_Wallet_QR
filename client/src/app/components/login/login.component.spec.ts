import { LoginComponent } from "./login.component";
import { IMock, Mock, Times, It } from "typemoq";
import { SignInApiService } from "src/app/services/api/signin-api.service";
import { Router } from "@angular/router";
import { StorageService } from "src/app/services/storage.service";
import { expectNothing } from "test-utils/expect-nothing";
import { IToken } from "src/app/models/token.interface";
import { IError } from "src/app/services/api/error.interface";

describe("LoginComponent", () => {

  let signinService: IMock<SignInApiService>;
  let router: IMock<Router>;
  let storageService: IMock<StorageService>;

  let subject: LoginComponent;

  beforeEach(() => {
    signinService = Mock.ofType<SignInApiService>();
    router = Mock.ofType<Router>();
    storageService = Mock.ofType<StorageService>();

    subject = new LoginComponent(signinService.object, router.object, storageService.object);
  });

  describe("ngOnInit", () => {

    it("should navigate to a user's profile if both the token and username are present", () => {
      const token = "This is a token";
      const username = "This is a username";

      given_storageService_get_returnsWhenGiven(token, "token");
      given_storageService_get_returnsWhenGiven(username, "username");

      subject.ngOnInit();

      router.verify(r => r.navigate(["@" + username]), Times.once());
      expectNothing();
    });

    it("should navigate to an emopty path if the token is present but the username is not", () => {
      const token = "This is a token";

      given_storageService_get_returnsWhenGiven(token, "token");

      subject.ngOnInit();

      router.verify(r => r.navigate([""]), Times.once());
      expectNothing();
    });
  });

  describe("login", () => {

    it("should set message to a given error message if the signin service returns one", async () => {
      const error: IError = {
        error: "This is an error message"
      };

      given_signinService_signIn_returns(error);

      await subject.login();

      expect(subject.message).toBe(error.error);
    });

    it("should keep the form enabled if the signin service returns an error", async () => {
      const error: IError = {
        error: "This is an error message"
      };

      given_signinService_signIn_returns(error);

      await subject.login();

      expect(subject.formEnabled).toBeTruthy();
    });

    it("should navigate to the username returned by the signin service", async () => {
      const token: IToken = {
        token: "This is a token",
        username: "This is a username"
      };

      given_signinService_signIn_returns(token);

      await subject.login();

      router.verify(r => r.navigate(["@" + token.username]), Times.once());
      expectNothing();
    });

    it("should disable the form on success being returned by the signin service", async () => {
      const token: IToken = {
        token: "This is a token",
        username: "This is a username"
      };

      given_signinService_signIn_returns(token);

      await subject.login();

      expect(subject.formEnabled).toBeFalsy();
    });
  });

  function given_storageService_get_returnsWhenGiven(returns: string, whenGiven: string) {
    storageService
      .setup(s => s.get(whenGiven))
      .returns(() => returns);
  }

  function given_signinService_signIn_returns(returns: IToken | IError) {
    signinService
      .setup(s => s.signIn(It.isAny()))
      .returns(async () => returns);
  }
});
