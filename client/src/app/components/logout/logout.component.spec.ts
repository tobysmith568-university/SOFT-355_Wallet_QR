import { LogoutComponent } from "./logout.component";
import { IMock, Mock, Times } from "typemoq";
import { StorageService } from "src/app/services/storage.service";
import { Router } from "@angular/router";
import { expectNothing } from "test-utils/expect-nothing";

describe("LogoutComponent", () => {

  let router: IMock<Router>;
  let storageService: IMock<StorageService>;

  let subject: LogoutComponent;

  beforeEach(() => {
    router = Mock.ofType<Router>();
    storageService = Mock.ofType<StorageService>();

    subject = new LogoutComponent(router.object, storageService.object);
  });

  describe("ngOnInit", () => {

    [
      "This is a token",
      "token",
      "",
      undefined,
      null
    ].forEach(token => it(`should clear any stored token if there is one: ${token}`, () => {

      given_storageService_get_returnsWhenGiven(token, "token");

      subject.ngOnInit();

      storageService.verify(s => s.remove("token"), Times.once());
      expectNothing();
    }));

    [
      "This is a username",
      "username",
      "",
      undefined,
      null
    ].forEach(username => it(`should clear any stored username if there is one: ${username}`, () => {

      given_storageService_get_returnsWhenGiven(username, "username");

      subject.ngOnInit();

      storageService.verify(s => s.remove("username"), Times.once());
      expectNothing();
    }));

    it("should navigate to an empty path", () => {

      subject.ngOnInit();

      router.verify(r => r.navigate([""]), Times.once());
      expectNothing();
    });
  });

  function given_storageService_get_returnsWhenGiven(returns: string, whenGiven: string) {
    storageService
      .setup(s => s.get(whenGiven))
      .returns(() => returns);
  }
});
