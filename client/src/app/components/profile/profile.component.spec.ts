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

  function given_activatedRoute_paramMap_returns(returns: Observable<ParamMap>) {
    activatedRoute
      .setup(a => a.paramMap)
      .returns(() => returns);
  }

  function given_subject_editWalletsWebsocket_isMocked() {
    subject.editWalletsWebsocket = editWalletsWebsocket.object;
  }

  function given_subject_wallets_equals(equals: IWallet[]) {
    subject.wallets = equals;
  }
});
