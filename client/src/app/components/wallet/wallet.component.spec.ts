import { WalletComponent } from "./wallet.component";
import { IMock, Mock, Times } from "typemoq";
import { StorageService } from "src/app/services/storage.service";
import { ActivatedRoute, ActivatedRouteSnapshot, ParamMap } from "@angular/router";
import { IWallet } from "src/app/models/wallet.interface";
import { toDataURL } from "qrcode";
import { EventEmitter } from "@angular/core";
import { expectNothing } from "test-utils/expect-nothing";

describe("WalletComponent", () => {

  let activatedRoute: IMock<ActivatedRoute>;
  let storageService: IMock<StorageService>;

  let subject: WalletComponent;

  beforeEach(() => {
    activatedRoute = Mock.ofType<ActivatedRoute>();
    storageService = Mock.ofType<StorageService>();

    subject = new WalletComponent(activatedRoute.object, storageService.object);
  });

  describe("ngOnInit", () => {

    it("should set QRData to the content of walletAddress", async () => {
      const wallet = {
        address: "This is the address"
      } as IWallet;
      const QRData = await toDataURL(wallet.address, {
        margin: 0
      });

      given_subject_wallet_equals(wallet);

      await subject.ngOnInit();

      expect(subject.qrData).toBe(QRData);
    });
  });

  describe("onOwnProfile", () => {

    it("should return true if the username parameter matches the stored username", () => {
      const username = "This is a username";

      given_storageService_get_returnsWhenGiven(username, "username");
      given_activatedRoute_snapshot_paramMap_get_returnsWhenGiven("@" + username, "username");

      const result = subject.onOwnProfile();

      expect(result).toBeTruthy();
    });

    it("should return false if the username parameter does not match the stored username", () => {
      const username = "This is a username";

      given_storageService_get_returnsWhenGiven(username, "username");
      given_activatedRoute_snapshot_paramMap_get_returnsWhenGiven("@" + username + "something else", "username");

      const result = subject.onOwnProfile();

      expect(result).toBeFalsy();
    });
  });

  describe("moveUp", () => {

    it("should emit move up event with the index", () => {
      const index = 5;
      const moveUpEventEmitter = Mock.ofType<EventEmitter<number>>();

      given_subject_index_equals(index);
      given_subject_moveUpEvent_equals(moveUpEventEmitter.object);

      subject.moveUp();

      moveUpEventEmitter.verify(m => m.emit(index), Times.once());
      expectNothing();
    });
  });

  describe("moveDown", () => {

    it("should emit move down event with the index", () => {
      const index = 5;
      const moveDownEventEmitter = Mock.ofType<EventEmitter<number>>();

      given_subject_index_equals(index);
      given_subject_moveDownEvent_equals(moveDownEventEmitter.object);

      subject.moveDown();

      moveDownEventEmitter.verify(m => m.emit(index), Times.once());
      expectNothing();
    });
  });

  describe("delete", () => {

    it("should emit delete event with the index", () => {
      const index = 5;
      const deleteEventEmitter = Mock.ofType<EventEmitter<number>>();

      given_subject_index_equals(index);
      given_subject_deleteEvent_equals(deleteEventEmitter.object);

      subject.delete();

      deleteEventEmitter.verify(m => m.emit(index), Times.once());
      expectNothing();
    });
  });

  function given_subject_wallet_equals(equals: IWallet) {
    subject.wallet = equals;
  }

  function given_subject_index_equals(equals: number) {
    subject.index = equals;
  }

  function given_subject_moveUpEvent_equals(equals: EventEmitter<number>) {
    subject.moveUpEvent = equals;
  }

  function given_subject_moveDownEvent_equals(equals: EventEmitter<number>) {
    subject.moveDownEvent = equals;
  }

  function given_subject_deleteEvent_equals(equals: EventEmitter<number>) {
    subject.deleteEvent = equals;
  }

  function given_storageService_get_returnsWhenGiven(returns: string, whenGiven: string) {
    storageService
      .setup(s => s.get(whenGiven))
      .returns(() => returns);
  }

  function given_activatedRoute_snapshot_paramMap_get_returnsWhenGiven(returns: string, whenGiven: string) {
    const activatedRouteSnapshot = Mock.ofType<ActivatedRouteSnapshot>();
    const paramMap = Mock.ofType<ParamMap>();

    paramMap
      .setup(p => p.get(whenGiven))
      .returns(() => returns);

    activatedRouteSnapshot
      .setup(a => a.paramMap)
      .returns(() => paramMap.object);

    activatedRoute
      .setup(a => a.snapshot)
      .returns(() => activatedRouteSnapshot.object);
  }
});
