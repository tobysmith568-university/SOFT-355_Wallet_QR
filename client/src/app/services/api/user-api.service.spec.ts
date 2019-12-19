import { TestBed } from "@angular/core/testing";
import { UserApiService } from "./user-api.service";
import { ApiService } from "./api.service";
import { Mock, IMock, It, Times } from "typemoq";
import { expectNothing } from "test-utils/expect-nothing";
import { ICreateUser } from "src/app/models/createuser.interface";
import { IError } from "./error.interface";
import { IUser } from "src/app/models/user.interface";

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

      given_apiService_post_returnswhenGiven(response, body);

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

      given_apiService_get_returnsWhenGiven(response, "/user/" + username);

      const result = await subject.getUser(username);

      expect(result).toBe(response);
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

  function given_apiService_post_returnswhenGiven(returns: ICreateUser | IError, whenGiven: ICreateUser) {
    apiService
      .setup(a => a.post(It.isAny(), whenGiven))
      .returns(async () => returns);
  }

  function given_apiService_get_returnsWhenGiven(returns: IUser, whenGiven: string) {
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
