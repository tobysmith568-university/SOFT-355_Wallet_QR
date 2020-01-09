import { IMock, Mock, Times } from "typemoq";
import { ApiService } from "./api.service";
import { TestBed } from "@angular/core/testing";
import { PasswordAPIService } from "./password-api.service";
import { expectNothing } from "test-utils/expect-nothing";

describe("Password API Service", () => {

  let apiService: IMock<ApiService>;

  let subject: PasswordAPIService;

  beforeEach(() => {
    apiService = Mock.ofType<ApiService>();

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useFactory: () => apiService.object }
      ]
    });

    subject = TestBed.get(PasswordAPIService);
  });

  it("should be created", () => {
    expect(subject).toBeTruthy();
  });

  describe("checkPassword", async () => {

    it("should call ApiService getExternal with the first 5 chars of the password hash", async () => {
      const password = "This is a password";
      const url = "https://api.pwnedpasswords.com/range/3746C";
      const response = "This is the request response";

      given_ApiService_getExternal_returns_whenGiven(response, url);

      await subject.checkPassword(password);

      apiService.verify(a => a.getExternal(url), Times.once());
      expectNothing();
    });

    it("should return the number matching the apropriate hash", async () => {
      const password = "This is a password";
      const url = "https://api.pwnedpasswords.com/range/3746C";
      const expectedMatches = 6;
      const response = `56C750C0ThisIsNotTheCorrectHashED57:1
57402ADDThisIsNotTheCorrectHashE856:1
582418EF1C13F5CDE1EABB1ED03A4C69AE7:${expectedMatches}
58369935ThisIsNotTheCorrectHashDBB4:1
58970999ThisIsNotTheCorrectHash7D39:1`;

      given_ApiService_getExternal_returns_whenGiven(response, url);

      const result = await subject.checkPassword(password);

      expect(result).toBe(expectedMatches);
    });

    it("should return 0 if apropriate hash cannot be found", async () => {
      const password = "This is a password";
      const url = "https://api.pwnedpasswords.com/range/3746C";
      const response = `56C750C0ThisIsNotTheCorrectHashED57:1
57402ADDThisIsNotTheCorrectHashE856:1
582418EFThisIsNotTheCorrectHash9AE7:1
58369935ThisIsNotTheCorrectHashDBB4:1
58970999ThisIsNotTheCorrectHash7D39:1`;

      given_ApiService_getExternal_returns_whenGiven(response, url);

      const result = await subject.checkPassword(password);

      expect(result).toBe(0);
    });
  });

  function given_ApiService_getExternal_returns_whenGiven(returns: string, whenGiven: string) {
    apiService
      .setup(a => a.getExternal(whenGiven))
      .returns(async () => returns);
  }
});
