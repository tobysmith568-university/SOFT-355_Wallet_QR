import { TestBed } from "@angular/core/testing";
import { ApiService } from "./api.service";
import { IMock, Mock, It, Times } from "typemoq";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { StorageService } from "../storage.service";
import { expectNothing } from "test-utils/expect-nothing";

describe("ApiService", () => {

  let httpClient: IMock<HttpClient>;
  let storageService: IMock<StorageService>;

  let subject: ApiService;

  beforeEach(() => {
    httpClient = Mock.ofType<HttpClient>();
    storageService = Mock.ofType<StorageService>();

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useFactory: () => httpClient.object },
        { provide: StorageService, useFactory: () => storageService.object }
      ]
    });

    subject = TestBed.get(ApiService);
  });

  it("should be created", () => {
    expect(subject).toBeTruthy();
  });

  describe("get", async () => {

    it("should call a route ending with the path", async () => {
      const path = "This is a path";

      given_httpClient_get_returns("anything");

      await subject.get(path);

      httpClient.verify(h => h.get(It.is((value) => value.endsWith(path)), It.isAny()), Times.once());
      expectNothing();
    });

    it("should call a route prepended with the base URL", async () => {
      const path = "This is a path";

      given_httpClient_get_returns("anything");

      await subject.get(path);

      httpClient.verify(h => h.get(It.is((value) => value.length > path.length), It.isAny()), Times.once());
      expectNothing();
    });

    it("should add an Authorization header from storage if it exists", async () => {
      const authHeader = "This is an auth header";

      given_httpClient_get_returns("anything");
      given_storageService_get_returnsWhenGiven(authHeader, "token");

      await subject.get("This is a path");

      httpClient.verify(h => h.get(It.isAny(), It.is((value) => {
        return (value.headers as HttpHeaders).get("Authorization") === authHeader;
      })), Times.once());
      expectNothing();
    });

    it("should return the response from the HttpClient", async () => {
      const authHeader = "This is an auth header";
      const response = "This is an http response";

      given_httpClient_get_returns(response);
      given_storageService_get_returnsWhenGiven(authHeader, "token");

      const result = await subject.get("This is a path");

      expect(result).toBe(response);
    });
  });

  describe("getExternal", async () => {

    it("should call the path exactly", async () => {
      const path = "This is a path";

      given_httpClient_get_returns("anything");

      await subject.getExternal(path);

      httpClient.verify(h => h.get(path, It.isAny()), Times.once());
      expectNothing();
    });

    it("should observe the body of the request", async () => {
      const path = "This is a path";

      given_httpClient_get_returns("anything");

      await subject.getExternal(path);

      httpClient.verify(h => h.get(It.isAny(), It.is((value) => value.observe as string === "body")), Times.once());
      expectNothing();
    });

    it("should have a response type of 'text'", async () => {
      const path = "This is a path";

      given_httpClient_get_returns("anything");

      await subject.getExternal(path);

      httpClient.verify(h => h.get(It.isAny(), It.is((value) => value.responseType as string === "text")), Times.once());
      expectNothing();
    });

    it("should return the response from the HttpClient", async () => {
      const path = "This is a path";
      const response = "This is an http response";

      given_httpClient_get_returns(response);

      const result = await subject.getExternal(path);

      expect(result).toBe(response);
    });
  });

  describe("post", async () => {

    it("should call a route ending with the path", async () => {
      const path = "This is a path";
      const body = "This is a body";

      given_httpClient_post_returns("anything");

      await subject.post(path, body);

      httpClient.verify(h => h.post(It.is((value) => value.endsWith(path)), It.isAny(), It.isAny()), Times.once());
      expectNothing();
    });

    it("should call a route prepended with the base URL", async () => {
      const path = "This is a path";
      const body = "This is a body";

      given_httpClient_post_returns("anything");

      await subject.post(path, body);

      httpClient.verify(h => h.post(It.is((value) => value.length > path.length), It.isAny(), It.isAny()), Times.once());
      expectNothing();
    });

    it("should call with the given body", async () => {
      const path = "This is a path";
      const body = "This is a body";

      given_httpClient_post_returns("anything");

      await subject.post(path, body);

      httpClient.verify(h => h.post(It.isAny(), body, It.isAny()), Times.once());
      expectNothing();
    });

    it("should return the response from the HttpClient", async () => {
      const path = "This is a path";
      const body = "This is a body";
      const response = "This is an http response";

      given_httpClient_post_returns(response);

      const result = await subject.post(path, body);

      expect(result).toBe(response);
    });
  });

  function given_httpClient_get_returns(returns: any) {
    httpClient
      .setup(h => h.get(It.isAny(), It.isAny()))
      .returns(() => of(returns));
  }

  function given_httpClient_post_returns(returns: any) {
    httpClient
      .setup(h => h.post(It.isAny(), It.isAny(), It.isAny()))
      .returns(() => of(returns));
  }

  function given_storageService_get_returnsWhenGiven(returns: string, whenGiven: string) {
    storageService
      .setup(s => s.get(whenGiven))
      .returns(() => returns);
  }
});
