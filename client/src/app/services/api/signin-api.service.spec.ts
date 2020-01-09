import { IMock, Mock, It, Times } from "typemoq";
import { ApiService } from "./api.service";
import { SignInApiService } from "./signin-api.service";
import { TestBed } from "@angular/core/testing";
import { StorageService } from "../storage.service";
import { IToken } from "src/app/models/token.interface";
import { IError } from "./error.interface";
import { ISignInRequest } from "src/app/models/signin-request.interface";
import { expectNothing } from "test-utils/expect-nothing";

describe("Password API Service", () => {

  let apiService: IMock<ApiService>;
  let storageService: IMock<StorageService>;

  let subject: SignInApiService;

  beforeEach(() => {
    apiService = Mock.ofType<ApiService>();
    storageService = Mock.ofType<StorageService>();

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useFactory: () => apiService.object },
        { provide: StorageService, useFactory: () => storageService.object }
      ]
    });

    subject = TestBed.get(SignInApiService);
  });

  it("should be created", () => {
    expect(subject).toBeTruthy();
  });

  describe("signIn", async () => {

    it("should make a post request", async () => {
      const request = {
        username: "username",
        password: "password"
      } as ISignInRequest;

      const response = {
        token: "token",
        username: "username"
      } as IToken;

      given_apiService_post_returns(response);

      await subject.signIn(request);

      apiService.verify(a => a.post(It.isAny(), It.isAny()), Times.once());
      expectNothing();
    });

    it("should make a reqest to /signin", async () => {
      const request = {
        username: "username",
        password: "password"
      } as ISignInRequest;

      const response = {
        token: "token",
        username: "username"
      } as IToken;

      given_apiService_post_returns(response);

      await subject.signIn(request);

      apiService.verify(a => a.post("/signin", It.isAny()), Times.once());
      expectNothing();
    });

    it("should make a request with the given body", async () => {
      const request = {
        username: "username",
        password: "password"
      } as ISignInRequest;

      const response = {
        token: "token",
        username: "username"
      } as IToken;

      given_apiService_post_returns(response);

      await subject.signIn(request);

      apiService.verify(a => a.post(It.isAny(), request), Times.once());
      expectNothing();
    });

    it("should return the response from the request made", async () => {
      const request = {
        username: "username",
        password: "password"
      } as ISignInRequest;

      const response = {
        token: "token",
        username: "username"
      } as IToken;

      given_apiService_post_returns(response);

      const result = await subject.signIn(request);

      expect(result).toBe(response);
    });

    it("should save the token in storage if the response is not an IError", async () => {
      const request = {
        username: "username",
        password: "password"
      } as ISignInRequest;

      const response = {
        token: "This is the returned token",
        username: "This is the returned username"
      } as IToken;

      given_apiService_post_returns(response);

      await subject.signIn(request);

      storageService.verify(s => s.setLocal("token", response.token), Times.once());
      expectNothing();
    });

    it("should save the username in storage if the response is not an IError", async () => {
      const request = {
        username: "username",
        password: "password"
      } as ISignInRequest;

      const response = {
        token: "This is the returned token",
        username: "This is the returned username"
      } as IToken;

      given_apiService_post_returns(response);

      await subject.signIn(request);

      storageService.verify(s => s.setLocal("username", response.username), Times.once());
      expectNothing();
    });

    it("should not save the token in storage if the response is an IError", async () => {
      const request = {
        username: "username",
        password: "password"
      } as ISignInRequest;

      const response = {
        error: "This is an error message"
      } as IError;

      given_apiService_post_returns(response);

      await subject.signIn(request);

      storageService.verify(s => s.setLocal("token", It.isAny()), Times.never());
      expectNothing();
    });

    it("should not save the username in storage if the response is an IError", async () => {
      const request = {
        username: "username",
        password: "password"
      } as ISignInRequest;

      const response = {
        error: "This is an error message"
      } as IError;

      given_apiService_post_returns(response);

      await subject.signIn(request);

      storageService.verify(s => s.setLocal("username", It.isAny()), Times.never());
      expectNothing();
    });
  });

  function given_apiService_post_returns(returns: IToken | IError) {
    apiService
      .setup(a => a.post(It.isAny(), It.isAny()))
      .returns(async () => returns);
  }
});
