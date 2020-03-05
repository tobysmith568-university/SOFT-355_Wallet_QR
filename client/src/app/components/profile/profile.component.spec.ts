import { ProfileComponent } from "./profile.component";
import { UserApiService } from "src/app/services/api/user-api.service";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { Mock, IMock, It, Times } from "typemoq";
import { StorageService } from "src/app/services/storage.service";
import { Observable } from "rxjs";
import { expectNothing } from "test-utils/expect-nothing";
import { isError } from "util";
import { IUser } from "src/app/models/user.interface";
import { IWallet } from "src/app/models/wallet.interface";
import { IError } from "src/app/services/api/error.interface";

describe("ProfileComponent", () => {
  let userService: IMock<UserApiService>;
  let activatedRoute: IMock<ActivatedRoute>;
  let router: IMock<Router>;
  let paramMap: IMock<Observable<ParamMap>>;
  let storageService: IMock<StorageService>;

  let subject: ProfileComponent;

  beforeEach((() => {
    userService = Mock.ofType<UserApiService>();
    activatedRoute = Mock.ofType<ActivatedRoute>();
    router = Mock.ofType<Router>();
    paramMap = Mock.ofType<Observable<ParamMap>>();
    storageService = Mock.ofType<StorageService>();

    subject = new ProfileComponent(userService.object, activatedRoute.object, router.object, storageService.object);
  }));

  describe("ngOnInit", async () => {

    it("should subscribe to the route paramMap", async () => {

      given_activatedRoute_paramMap_returns(paramMap.object);

      subject.ngOnInit();

      paramMap.verify(p => p.subscribe(It.isAny()), Times.once());
      expectNothing();
    });
  });

  describe("isError", () => {

    it ("should return false if the value has no 'error'", () => {
      const error = {
        displayName: "This is not an error"
      } as IUser;

      const result = isError(error);

      expect(result).toBeFalsy();
    });
  });

  describe("loadProfile", () => {

    it("should navigate to /404 if the username is shorter than 2 characters", async () => {
      const username = "@";
      const params = Mock.ofType<ParamMap>();
      params
        .setup(p => p.get("username"))
        .returns(() => username);

      await subject.loadProfile(params.object);

      router.verify(r => r.navigate(["/404"], It.isAny()), Times.once());
      expectNothing();
    });

    it("should navigate and skip the location change if the username is shorter than 2 characters", async () => {
      const username = "@";
      const params = Mock.ofType<ParamMap>();
      params
        .setup(p => p.get("username"))
        .returns(() => username);

      await subject.loadProfile(params.object);

      router.verify(r => r.navigate(It.isAny(), It.isObjectWith({ skipLocationChange: true })), Times.once());
      expectNothing();
    });

    it("should navigate with a state containing the username if the username is shorter than 2 characters", async () => {
      const username = "@";
      const params = Mock.ofType<ParamMap>();
      params
        .setup(p => p.get("username"))
        .returns(() => username);

      await subject.loadProfile(params.object);

      router.verify(r => r.navigate(It.isAny(), It.isObjectWith({ state: { username } })), Times.once());
      expectNothing();
    });

    it("should navigate to /404 if the username doesn't being with an '@'", async () => {
      const username = "NoAtHere";
      const params = Mock.ofType<ParamMap>();
      params
        .setup(p => p.get("username"))
        .returns(() => username);

      await subject.loadProfile(params.object);

      router.verify(r => r.navigate(["/404"], It.isAny()), Times.once());
      expectNothing();
    });

    it("should navigate and skip the location change if the username doesn't being with an '@'", async () => {
      const username = "NoAtHere";
      const params = Mock.ofType<ParamMap>();
      params
        .setup(p => p.get("username"))
        .returns(() => username);

      await subject.loadProfile(params.object);

      router.verify(r => r.navigate(It.isAny(), It.isObjectWith({ skipLocationChange: true })), Times.once());
      expectNothing();
    });

    it("should navigate with a state containing the username if the username doesn't being with an '@'", async () => {
      const username = "NoAtHere";
      const params = Mock.ofType<ParamMap>();
      params
        .setup(p => p.get("username"))
        .returns(() => username);

      await subject.loadProfile(params.object);

      router.verify(r => r.navigate(It.isAny(), It.isObjectWith({ state: { username } })), Times.once());
      expectNothing();
    });

    it("should set subject name to the error if the user service returns one", async () => {
      const username = "@This is a username";
      const usernameWithNoAt = "This is a username";
      const params = Mock.ofType<ParamMap>();

      const error = {
        error: "This is an error message"
      } as IError;

      params
        .setup(p => p.get("username"))
        .returns(() => username);

      given_userService_getUser_returnsWhenGiven(error, usernameWithNoAt);

      await subject.loadProfile(params.object);

      expect(subject.name).toBe(error.error);
    });

    it("should set loaded to true if the user service returns an error", async () => {
      const username = "@This is a username";
      const usernameWithNoAt = "This is a username";
      const params = Mock.ofType<ParamMap>();

      const error = {
        error: "This is an error message"
      } as IError;

      params
        .setup(p => p.get("username"))
        .returns(() => username);

      given_userService_getUser_returnsWhenGiven(error, usernameWithNoAt);

      await subject.loadProfile(params.object);

      expect(subject.loaded).toBeTruthy();
    });
  });

  describe("deleteWallet", () => {

  });

  describe("moveWalletUp", () => {

  });

  describe("moveWalletDown", () => {

  });

  describe("sendUpdate", () => {

  });

  function given_subject_wallets_equals(equals: IWallet[]) {
    subject.wallets = equals;
  }

  function given_activatedRoute_paramMap_returns(returns: Observable<ParamMap>) {
    activatedRoute
      .setup(a => a.paramMap)
      .returns(() => returns);
  }

  function given_userService_getUser_returnsWhenGiven(returns: IUser | IError, whengiven: string) {
    userService
      .setup(u => u.getUser(whengiven))
      .returns(async () => returns);
  }
});
