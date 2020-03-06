import { TestBed } from "@angular/core/testing";
import { UserApiService } from "./user-api.service";
import { ApiService } from "./api.service";
import { Mock, IMock, It, Times } from "typemoq";
import { expectNothing } from "test-utils/expect-nothing";
import { ICreateUser } from "src/app/models/createuser.interface";
import { IError } from "./error.interface";
import { IUser } from "src/app/models/user.interface";
import { ISearchResult } from "src/app/models/search-result.interface";
import { IWallet } from "src/app/models/wallet.interface";

describe("UserApiService", () => {
  let apiService: IMock<ApiService>;

  let subject: UserApiService;

  beforeEach(() => {
    apiService = Mock.ofType<ApiService>();

    TestBed.configureTestingModule({
      providers: [
        UserApiService,
        { provide: ApiService, useFactory: () => apiService.object }
      ]
    });

    subject = TestBed.get(UserApiService);
  });

  it("should be created", () => {
    expect(subject).toBeTruthy();
  });

  describe("createUser", async () => {

    it("should make a post request to the api service", async () => {
      const username = "This is a username";
      const displayName  = "This is a display name";
      const email = "This is an email address";
      const password = "This is a password";

      await subject.createUser(username, displayName, email, password);

      apiService.verify(a => a.post(It.isAny(), It.isAny()), Times.once());
      expectNothing();
    });

    it("should post to '/user'", async () => {
      const username = "This is a username";
      const displayName  = "This is a display name";
      const email = "This is an email address";
      const password = "This is a password";

      await subject.createUser(username, displayName, email, password);

      apiService.verify(a => a.post("/user", It.isAny()), Times.once());
      expectNothing();
    });

    it("should post the given data in a body", async () => {
      const username = "This is a username";
      const displayName  = "This is a display name";
      const email = "This is an email address";
      const password = "This is a password";

      const expectedBody = {
        username,
        displayName,
        email,
        password
      } as ICreateUser;

      await subject.createUser(username, displayName, email, password);

      apiService.verify(a => a.post(It.isAny(), expectedBody), Times.once());
      expectNothing();
    });

    it("should return the request response", async () => {
      const username = "This is a username";
      const displayName  = "This is a display name";
      const email = "This is an email address";
      const password = "This is a password";

      const body = {
        username,
        displayName,
        email,
        password
      } as ICreateUser;

      const response = {
        displayName: "This is some response data"
      } as ICreateUser;

      given_apiService_post_returnswhenGivenForPath(response, body, "/user");

      const result = await subject.createUser(username, displayName, email, password);

      expect(result).toBe(response);
    });
  });

  describe("getUser", async () => {

    it("should make a get request to the api service", async () => {
      const username = "This is a username";

      await subject.getUser(username);

      apiService.verify(a => a.get(It.isAny()), Times.once());
      expectNothing();
    });

    it("should get from '/user/' + a given username", async () => {
      const username = "This is a username";

      await subject.getUser(username);

      apiService.verify(a => a.get("/user/" + username), Times.once());
      expectNothing();
    });

    it("should return the request response", async () => {
      const username = "This is a username";

      const response = {
        displayName: "This is some response data"
      } as IUser;

      given_apiService_get_returnsWhenGiven<IUser>(response, "/user/" + username);

      const result = await subject.getUser(username);

      expect(result).toBe(response);
    });
  });

  describe("updateUser", async () => {

    it("should make a patch request to the api service", async () => {
      const username = "This is a username";

      await subject.updateUser(username, {});

      apiService.verify(a => a.patch(It.isAny(), It.isAny()), Times.once());
      expectNothing();
    });

    it("should patch to '/user/' + a given username", async () => {
      const username = "This is a username";

      await subject.updateUser(username, {});

      apiService.verify(a => a.patch("/user/" + username, It.isAny()), Times.once());
      expectNothing();
    });

    it("should patch the given partial user", async () => {
      const user: Partial<IUser> = {
        email: "This is an email address"
      };

      await subject.updateUser("anything", user);

      apiService.verify(a => a.patch(It.isAny(), user), Times.once());
      expectNothing();
    });
  });

  describe("userExists", async () => {

    it("should make a head request to the api service", async () => {
      const username = "This is a username";

      await subject.userExists(username);

      apiService.verify(a => a.head(It.isAny()), Times.once());
      expectNothing();
    });

    it("should head to '/user/' + a given username", async () => {
      const username = "This is a username";

      await subject.userExists(username);

      apiService.verify(a => a.head("/user/" + username), Times.once());
      expectNothing();
    });

    it("should return the request response", async () => {
      const username = "This is a username";

      const response = true;

      given_apiService_head_returnsWhenGiven(response, "/user/" + username);

      const result = await subject.userExists(username);

      expect(result).toBe(response);
    });
  });

  describe("search", async () => {

    it("should get search results from the api service at /search/:term", async () => {
      const term = "anything";

      given_apiService_get_returnsWhenGiven([], "/search/" + term);

      await subject.search(term);

      apiService.verify(a => a.get("/search/" + term), Times.once());
      expectNothing();
    });

    it("should return an empty array on error", async () => {
      const term = "anything";

      given_apiService_get_returnsWhenGiven<IError>({
        error: "This is an error message"
      }, "/search/" + term);

      const result = await subject.search(term);

      expect(result.length).toBe(0);
    });

    it("should return successful results", async () => {
      const term = "anything";
      const results: ISearchResult[] = [
        {
          name: "This is a name",
          username: "This is a username"
        }
      ];

      given_apiService_get_returnsWhenGiven<ISearchResult[]>(results, "/search/" + term);

      const result = await subject.search(term);

      expect(result).toBe(results);
    });
  });

  describe("addWallet", async () => {

    it("should post to /wallet", async () => {
      const wallet: IWallet = {
        address: "This is an address",
        currency: "This is a currency",
        name: "This is a name"
      };

      given_apiService_post_returnswhenGivenForPath<any, IWallet>({}, wallet, "/wallet");

      await subject.addWallet(wallet);

      apiService.verify(a => a.post("/wallet", wallet), Times.once());
      expectNothing();
    });
  });

  function given_apiService_post_returnswhenGivenForPath<T, S>(returns: T | IError, whenGiven: S, forPath: string) {
    apiService
      .setup(a => a.post(forPath, whenGiven))
      .returns(async () => returns);
  }

  function given_apiService_get_returnsWhenGiven<T>(returns: T, whenGiven: string) {
    apiService
      .setup(a => a.get(whenGiven))
      .returns(async () => returns);
  }

  function given_apiService_head_returnsWhenGiven(returns: boolean, whenGiven: string) {
    apiService
      .setup(a => a.head(whenGiven))
      .returns(async () => returns);
  }
});
