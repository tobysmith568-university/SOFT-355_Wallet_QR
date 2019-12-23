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
  let editWalletsWebsocket: IMock<SocketIOClient.Socket>;

  let subject: ProfileComponent;

  beforeEach((() => {
    userService = Mock.ofType<UserApiService>();
    activatedRoute = Mock.ofType<ActivatedRoute>();
    router = Mock.ofType<Router>();
    paramMap = Mock.ofType<Observable<ParamMap>>();
    storageService = Mock.ofType<StorageService>();
    editWalletsWebsocket = Mock.ofType<SocketIOClient.Socket>();

    subject = new ProfileComponent(userService.object, activatedRoute.object, router.object, storageService.object);
  }));

  describe("ngOnInit", async () => {

    it("should subscribe to the route paramMap", async () => {

      given_activatedRoute_paramMap_returns(paramMap.object);

      subject.ngOnInit();

      paramMap.verify(p => p.subscribe(It.isAny()), Times.once());
      expectNothing();
    });

    it("should create the editWalletsWebsocket", async () => {

      given_activatedRoute_paramMap_returns(paramMap.object);

      await subject.ngOnInit();

      expect(subject.editWalletsWebsocket).toBeDefined();
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

    it("should emit to profile on the editWalletsWebsocket", async () => {
      const username = "@This is a username";
      const usernameWithNoAt = "This is a username";
      const params = Mock.ofType<ParamMap>();

      const user = {
        displayName: "This is a display name"
      } as IUser;

      params
        .setup(p => p.get("username"))
        .returns(() => username);

      given_subject_editWalletsWebsocket_isMocked();
      given_userService_getUser_returnsWhenGiven(user, usernameWithNoAt);

      await subject.loadProfile(params.object);

      editWalletsWebsocket.verify(e => e.emit("profile", It.isAny()), Times.once());
      expectNothing();
    });

    it("should emit the username with no @ to the editWalletsWebsocket", async () => {
      const username = "@This is a username";
      const usernameWithNoAt = "This is a username";
      const params = Mock.ofType<ParamMap>();

      const user = {
        displayName: "This is a display name"
      } as IUser;

      params
        .setup(p => p.get("username"))
        .returns(() => username);

      given_subject_editWalletsWebsocket_isMocked();
      given_userService_getUser_returnsWhenGiven(user, usernameWithNoAt);

      await subject.loadProfile(params.object);

      editWalletsWebsocket.verify(e => e.emit(It.isAny(), usernameWithNoAt), Times.once());
      expectNothing();
    });

    it("should set loaded to true", async () => {
      const username = "@This is a username";
      const usernameWithNoAt = "This is a username";
      const params = Mock.ofType<ParamMap>();

      const user = {
        displayName: "This is a display name"
      } as IUser;

      params
        .setup(p => p.get("username"))
        .returns(() => username);

      given_subject_editWalletsWebsocket_isMocked();
      given_userService_getUser_returnsWhenGiven(user, usernameWithNoAt);

      await subject.loadProfile(params.object);

      expect(subject.loaded).toBeTruthy();
    });

    it("should set name to the received display name", async () => {
      const username = "@This is a username";
      const usernameWithNoAt = "This is a username";
      const params = Mock.ofType<ParamMap>();

      const user = {
        displayName: "This is a display name"
      } as IUser;

      params
        .setup(p => p.get("username"))
        .returns(() => username);

      given_subject_editWalletsWebsocket_isMocked();
      given_userService_getUser_returnsWhenGiven(user, usernameWithNoAt);

      await subject.loadProfile(params.object);

      expect(subject.name).toBe(user.displayName);
    });

    it("should set wallets to the received wallets", async () => {
      const username = "@This is a username";
      const usernameWithNoAt = "This is a username";
      const params = Mock.ofType<ParamMap>();

      const user = {
        wallets: [
          {
            address: "This is an wallet address",
            currency: "This is a wallet currency",
            name: "This is a wallet name"
          } as IWallet
        ]
      } as IUser;

      params
        .setup(p => p.get("username"))
        .returns(() => username);

      given_subject_editWalletsWebsocket_isMocked();
      given_userService_getUser_returnsWhenGiven(user, usernameWithNoAt);

      await subject.loadProfile(params.object);

      expect(subject.wallets).toBe(user.wallets);
    });
  });

  describe("deleteWallet", () => {

    it ("should remove a wallet", () => {
      const wallet1: IWallet = { address: "Address 1", currency: "Currency 1", name: "Name 1" };
      const wallet2: IWallet = { address: "Address 2", currency: "Currency 2", name: "Name 2" };
      const wallet3: IWallet = { address: "Address 3", currency: "Currency 3", name: "Name 3" };
      const wallets: IWallet[] = [
        wallet1,
        wallet2,
        wallet3
      ];

      given_subject_editWalletsWebsocket_isMocked();
      given_subject_wallets_equals(wallets);

      subject.deleteWallet(2);

      expect(subject.wallets.length).toBe(2);
      expect(subject.wallets).not.toContain(wallet3);
    });
  });

  describe("moveWalletUp", () => {

    it ("should move a wallet up an index", () => {
      const wallet1: IWallet = { address: "Address 1", currency: "Currency 1", name: "Name 1" };
      const wallet2: IWallet = { address: "Address 2", currency: "Currency 2", name: "Name 2" };
      const wallet3: IWallet = { address: "Address 3", currency: "Currency 3", name: "Name 3" };
      const wallets: IWallet[] = [
        wallet1,
        wallet2,
        wallet3
      ];

      given_subject_editWalletsWebsocket_isMocked();
      given_subject_wallets_equals(wallets);

      subject.moveWalletUp(1);

      expect(subject.wallets[2]).toBe(wallet2);
    });
  });

  describe("moveWalletDown", () => {

    it ("should move a wallet down an index", () => {
      const wallet1: IWallet = { address: "Address 1", currency: "Currency 1", name: "Name 1" };
      const wallet2: IWallet = { address: "Address 2", currency: "Currency 2", name: "Name 2" };
      const wallet3: IWallet = { address: "Address 3", currency: "Currency 3", name: "Name 3" };
      const wallets: IWallet[] = [
        wallet1,
        wallet2,
        wallet3
      ];

      given_subject_editWalletsWebsocket_isMocked();
      given_subject_wallets_equals(wallets);

      subject.moveWalletDown(1);

      expect(subject.wallets[0]).toBe(wallet2);
    });
  });

  describe("sendUpdate", () => {

    it ("should call emit on the editWalletsWebsocket", () => {

      given_subject_editWalletsWebsocket_isMocked();

      subject.sendUpdate();

      editWalletsWebsocket.verify(e => e.emit("set", It.isAny()), Times.once());
      expectNothing();
    });
  });

  function given_subject_editWalletsWebsocket_isMocked() {
    subject.editWalletsWebsocket = editWalletsWebsocket.object;
  }

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
