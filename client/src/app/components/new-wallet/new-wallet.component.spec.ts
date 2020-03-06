import { NewWalletComponent } from "./new-wallet.component";
import { IMock, Mock, Times, It } from "typemoq";
import { Router } from "@angular/router";
import { UserApiService } from "src/app/services/api/user-api.service";
import { StorageService } from "src/app/services/storage.service";
import { expectNothing } from "test-utils/expect-nothing";
import { IUser } from "src/app/models/user.interface";
import { IError } from "src/app/services/api/error.interface";
import { LocationService } from "src/app/services/location.service";
import { IWallet } from "src/app/models/wallet.interface";

describe("NewWalletComponent", () => {

  let router: IMock<Router>;
  let userApiService: IMock<UserApiService>;
  let storageService: IMock<StorageService>;
  let locationService: IMock<LocationService>;

  let subject: NewWalletComponent;

  beforeEach(() => {
    router = Mock.ofType<Router>();
    userApiService = Mock.ofType<UserApiService>();
    storageService = Mock.ofType<StorageService>();
    locationService = Mock.ofType<LocationService>();

    subject = new NewWalletComponent(router.object, userApiService.object, storageService.object, locationService.object);
  });

  describe("ngOnInit", () => {

    [
      "",
      null
    ].forEach(token => it(`should navigate to an empty path if a the stored token equals: ${token}`, async () => {

      given_storageService_get_returnsWhenGiven(token, "token");

      await subject.ngOnInit();

      router.verify(r => r.navigate(["/"]), Times.once());
      expectNothing();
    }));

    it("should keep the form disabled if the user service returns an error", async () => {
      const username = "This is a username";
      const error: IError = {
        error: "This is an error message"
      };

      given_storageService_get_returnsWhenGiven(username, "username");
      given_userService_getUser_returnsWhenGiven(error, username);
      given_storageService_get_returnsWhenGiven("This is a token", "token");

      await subject.ngOnInit();

      expect(subject.formEnabled).toBeFalsy();
    });

    it("should enable the form if the given user has verified their email", async () => {
      const username = "This is a username";
      const user: IUser = {
        username: "This is a username",
        emailVerified: true
      } as IUser;

      given_storageService_get_returnsWhenGiven(username, "username");
      given_userService_getUser_returnsWhenGiven(user, username);
      given_storageService_get_returnsWhenGiven("This is a token", "token");

      await subject.ngOnInit();

      expect(subject.formEnabled).toBeTruthy();
    });

    it("should set emailUnverified to false if the given user has verified their email", async () => {
      const username = "This is a username";
      const user: IUser = {
        username: "This is a username",
        emailVerified: true
      } as IUser;

      given_storageService_get_returnsWhenGiven(username, "username");
      given_userService_getUser_returnsWhenGiven(user, username);
      given_storageService_get_returnsWhenGiven("This is a token", "token");

      await subject.ngOnInit();

      expect(subject.emailUnverified).toBeFalsy();
    });

    it("should set emailUnverified to true if the given user has not verified their email", async () => {
      const username = "This is a username";
      const user: IUser = {
        username: "This is a username",
        emailVerified: false
      } as IUser;

      given_storageService_get_returnsWhenGiven(username, "username");
      given_userService_getUser_returnsWhenGiven(user, username);
      given_storageService_get_returnsWhenGiven("This is a token", "token");

      await subject.ngOnInit();

      expect(subject.emailUnverified).toBeTruthy();
    });
  });

  describe("currencyFocusOut", () => {

    it("should set a currency error if currency is null", () => {

      given_subject_currency_equals(null);

      subject.currencyFocusOut();

      expect(subject.currencyError).toBe("You need to enter a currency");
    });

    it("should set a currency error if currency is undefined", () => {

      given_subject_currency_equals(undefined);

      subject.currencyFocusOut();

      expect(subject.currencyError).toBe("You need to enter a currency");
    });

    it("should set a currency error if currency is an empty string", () => {

      given_subject_currency_equals("");

      subject.currencyFocusOut();

      expect(subject.currencyError).toBe("You need to enter a currency");
    });

    it("should set a currency error to an empty string", () => {

      given_subject_currency_equals("anything");

      subject.currencyFocusOut();

      expect(subject.currencyError).toBe("");
    });
  });

  describe("addressFocusOut", () => {

    it("should set a address error if address is null", () => {

      given_subject_address_equals(null);

      subject.addressFocusOut();

      expect(subject.addressError).toBe("You need to enter an address");
    });

    it("should set a address error if address is undefined", () => {

      given_subject_address_equals(undefined);

      subject.addressFocusOut();

      expect(subject.addressError).toBe("You need to enter an address");
    });

    it("should set a address error if address is an empty string", () => {

      given_subject_address_equals("");

      subject.addressFocusOut();

      expect(subject.addressError).toBe("You need to enter an address");
    });

    it("should set a address error to an empty string", () => {

      given_subject_address_equals("anything");

      subject.addressFocusOut();

      expect(subject.addressError).toBe("");
    });
  });

  describe("create", () => {

    it("should do nothing if there is a currency error", async () => {
      given_subject_formEnabled_equals(true);
      given_subject_address_equals("anything");

      await subject.create();

      expect(subject.formEnabled).toBeTruthy();
    });

    it("should do nothing if there is an address error", async () => {
      given_subject_formEnabled_equals(true);
      given_subject_currency_equals("anything");

      await subject.create();

      expect(subject.formEnabled).toBeTruthy();
    });

    it("should call addWallet on the userAPIService with the correct address", async () => {
      const address = "this is an address";

      given_subject_formEnabled_equals(true);
      given_subject_address_equals(address);
      given_subject_currency_equals("anything");

      await subject.create();

      userApiService.verify(u => u.addWallet(It.is<IWallet>(w => w.address === address)), Times.once());
      expectNothing();
    });

    it("should call addWallet on the userAPIService with the correct currency", async () => {
      const currency = "this is a currency";

      given_subject_formEnabled_equals(true);
      given_subject_address_equals("anything");
      given_subject_currency_equals(currency);

      await subject.create();

      userApiService.verify(u => u.addWallet(It.is<IWallet>(w => w.currency === currency)), Times.once());
      expectNothing();
    });

    it("should call addWallet on the userAPIService with the correct name", async () => {
      const name = "this is a name";

      given_subject_formEnabled_equals(true);
      given_subject_address_equals("anything");
      given_subject_currency_equals("anything");
      given_subject_name_equals(name);

      await subject.create();

      userApiService.verify(u => u.addWallet(It.is<IWallet>(w => w.name === name)), Times.once());
      expectNothing();
    });

    it("should reload the page if the 'stay on this page' checkbox is checked", async () => {
      given_subject_formEnabled_equals(true);
      given_subject_address_equals("anything");
      given_subject_currency_equals("anything");
      given_subject_name_equals("anything");
      given_subject_another_equals(true);

      await subject.create();

      locationService.verify(l => l.reload(), Times.once());
      expectNothing();
    });

    it("should not reload the page if the 'stay on this page' checkbox is not checked", async () => {
      given_subject_formEnabled_equals(true);
      given_subject_address_equals("anything");
      given_subject_currency_equals("anything");
      given_subject_name_equals("anything");
      given_subject_another_equals(false);

      await subject.create();

      locationService.verify(l => l.reload(), Times.never());
      expectNothing();
    });
  });

  function given_subject_currency_equals(equals: string) {
    subject.currency = equals;
  }

  function given_subject_address_equals(equals: string) {
    subject.address = equals;
  }

  function given_subject_name_equals(equals: string) {
    subject.name = equals;
  }

  function given_subject_another_equals(equals: boolean) {
    subject.another = equals;
  }

  function given_subject_formEnabled_equals(equals: boolean) {
    subject.formEnabled = equals;
  }

  function given_storageService_get_returnsWhenGiven(returns: string, whenGiven: string) {
    storageService
      .setup(s => s.get(whenGiven))
      .returns(() => returns);
  }

  function given_userService_getUser_returnsWhenGiven(returns: IUser | IError, whenGiven: string) {
    userApiService
      .setup(u => u.getUser(whenGiven))
      .returns(async () => returns);
  }
});
