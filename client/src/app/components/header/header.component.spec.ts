import { HeaderComponent } from "./header.component";
import { IMock, Mock, It, Times } from "typemoq";
import { Router } from "@angular/router";
import { StorageService } from "src/app/services/storage.service";
import { Observable } from "rxjs";
import { Event } from "@angular/router";
import { expectNothing } from "test-utils/expect-nothing";
import { ISearchResult } from "src/app/models/search-result.interface";
import { UserApiService } from "src/app/services/api/user-api.service";

describe("HeaderComponent", () => {
  let router: IMock<Router>;
  let storageService: IMock<StorageService>;
  let userAPIService: IMock<UserApiService>;

  let subject: HeaderComponent;

  beforeEach(() => {
    router = Mock.ofType<Router>();
    storageService = Mock.ofType<StorageService>();
    userAPIService = Mock.ofType<UserApiService>();

    subject = new HeaderComponent(router.object, storageService.object, userAPIService.object);
  });

  describe("ngOnInit", async () => {

    it("should subscribe to the router events", async () => {
      const event = Mock.ofType<Observable<Event>>();

      given_router_event_equals(event.object);

      await subject.ngOnInit();

      event.verify(e => e.subscribe(It.isAny()), Times.once());
      expectNothing();
    });

    it("should get username from the storageService", async () => {
      const username = "This is a username";
      const event = Mock.ofType<Observable<Event>>();

      given_router_event_equals(event.object);
      given_storageService_get_returnsWhenGiven(username, "username");

      await subject.ngOnInit();

      expect(subject.username).toBe(username);
    });
  });

  describe("isCurrent", () => {

    it("should return true if route equals current route", () => {
      const currentRoute = "This is the current route";

      given_subject_currentRoute_equals(currentRoute);

      const result = subject.isCurrent(currentRoute);

      expect(result).toBeTruthy();
    });

    it("should return false if route does not equal the current route", () => {
      const currentRoute = "This is the current route";

      given_subject_currentRoute_equals(currentRoute);

      const result = subject.isCurrent(currentRoute + "something");

      expect(result).toBeFalsy();
    });
  });

  describe("isLoggedIn", () => {

    it("should return false if the username token is null", () => {
      given_storageService_get_returnsWhenGiven(null, "token");

      const result = subject.isLoggedIn();

      expect(result).toBeFalsy();
    });

    it("should return false if the username token is an empty string", () => {
      given_storageService_get_returnsWhenGiven("", "token");

      const result = subject.isLoggedIn();

      expect(result).toBeFalsy();
    });

    it("should return true if the username token present", () => {
      given_storageService_get_returnsWhenGiven("I am anything", "token");

      const result = subject.isLoggedIn();

      expect(result).toBeTruthy();
    });
  });

  describe("search", () => {

    it("should empty the search results if the searchTerm is empty", async () => {
      given_subject_searchTerm_equals("");

      await subject.search();

      expect(subject.searchResults.length).toBe(0);
    });

    it("should populate the search results if the searchTerm is not empty", async () => {
      const searchTerm = "something";
      const results: ISearchResult[] = [
        {
          name: "Result name",
          username: "Result username"
        }
      ];

      given_subject_searchTerm_equals(searchTerm);
      given_userAPIService_search_returnsWhenGiven(results, searchTerm);

      await subject.search();

      expect(subject.searchResults).toEqual(results);
    });
  });

  describe("searchBlur", () => {

    it("should empty the search results after 100ms", () => {

      given_subject_searchResults_equal([{ name: "This is some data", username: "This is some data" }]);

      subject.searchBlur();

      setTimeout(() => {
        expect(subject.searchResults.length).toBe(0);
      }, 100);
      expectNothing();
    });
  });

  describe("keypress", () => {

    it("should increment the focused result if the key down key is pressed and there are more search results", () => {
      const focusedResult = 3;
      const keyboardEvent = Mock.ofType<KeyboardEvent>();

      keyboardEvent
        .setup(k => k.code)
        .returns(() => "ArrowDown");

      given_subject_focusedResult_equals(focusedResult);
      given_subject_searchResults_equal([undefined, undefined, undefined, undefined, undefined]);

      subject.keypress(keyboardEvent.object);

      expect(subject.focusedResult).toBe(focusedResult + 1);
    });

    it("should not increment the focused result if the key down key is pressed but there are no more search results", () => {
      const focusedResult = 3;
      const keyboardEvent = Mock.ofType<KeyboardEvent>();

      keyboardEvent
        .setup(k => k.code)
        .returns(() => "ArrowDown");

      given_subject_focusedResult_equals(focusedResult);
      given_subject_searchResults_equal([undefined, undefined, undefined]);

      subject.keypress(keyboardEvent.object);

      expect(subject.focusedResult).toBe(focusedResult);
    });

    it("should decrement the focused result if the key up key is pressed and focused result is greater than 0", () => {
      const focusedResult = 3;
      const keyboardEvent = Mock.ofType<KeyboardEvent>();

      keyboardEvent
        .setup(k => k.code)
        .returns(() => "ArrowUp");

      given_subject_focusedResult_equals(focusedResult);

      subject.keypress(keyboardEvent.object);

      expect(subject.focusedResult).toBe(focusedResult - 1);
    });

    it("should not decrement the focused result if the key up key is pressed but the focused result is 0", () => {
      const focusedResult = 0;
      const keyboardEvent = Mock.ofType<KeyboardEvent>();

      keyboardEvent
        .setup(k => k.code)
        .returns(() => "ArrowUp");

      given_subject_focusedResult_equals(focusedResult);
      given_subject_searchResults_equal([undefined, undefined, undefined]);

      subject.keypress(keyboardEvent.object);

      expect(subject.focusedResult).toBe(focusedResult);
    });
  });

  describe("goToProfile", () => {

    [
      "This is a username",
      "username",
      "a"
    ].forEach(username => it(`should navigate to a given username: ${username}`, () => {

      subject.goToProfile(username);

      router.verify(r => r.navigate(["@" + username]), Times.once());
      expectNothing();
    }));

    [
      "This is a username",
      "username",
      "a"
    ].forEach(username => it(`should remove the search term when navigating to a given username: ${username}`, () => {

      subject.goToProfile(username);

      expect(subject.searchTerm).toBe("");
    }));

    [
      "This is a username",
      "username",
      "a"
    ].forEach(username => it(`should remove the search results when navigating to a given username: ${username}`, () => {

      subject.goToProfile(username);

      expect(subject.searchResults.length).toBe(0);
    }));

    it("should navigate to the focused search result if the given username is undefined", () => {
      const searchResults: ISearchResult[] = [
        { name: "This is #1", username: "This is #1" },
        { name: "This is #2", username: "This is #2" },
        { name: "This is #3", username: "This is #3" }
      ];

      given_subject_searchResults_equal(searchResults);
      given_subject_focusedResult_equals(1);

      subject.goToProfile(undefined);

      router.verify(r => r.navigate(["@" + searchResults[1].username]), Times.once());
      expectNothing();
    });

    it("should navigate to the search term if the focused search result and given username are undefined", () => {
      const searchTerm = "This is a search term";

      given_subject_searchResults_equal([undefined]);
      given_subject_focusedResult_equals(0);
      given_subject_searchTerm_equals(searchTerm);

      subject.goToProfile(undefined);

      router.verify(r => r.navigate(["@" + searchTerm]), Times.once());
      expectNothing();
    });

    [
      "This is a username",
      "username",
      "a"
    ].forEach(username => it(`should set the focused result to -1: ${username}`, () => {

      subject.goToProfile(username);

      expect(subject.searchResults.length).toBe(0);
    }));
  });

  function given_subject_currentRoute_equals(equals: string) {
    subject.currentRoute = equals;
  }

  function given_subject_searchTerm_equals(equals: string) {
    subject.searchTerm = equals;
  }

  function given_subject_searchResults_equal(equal: ISearchResult[]) {
    subject.searchResults = equal;
  }

  function given_subject_focusedResult_equals(equals: number) {
    subject.focusedResult = equals;
  }

  function given_router_event_equals(equals: Observable<Event>) {
    router
      .setup(r => r.events)
      .returns(() => equals);
  }

  function given_storageService_get_returnsWhenGiven(returns: string, whenGiven: string) {
    storageService
      .setup(s => s.get(whenGiven))
      .returns(() => returns);
  }

  function given_userAPIService_search_returnsWhenGiven(returns: ISearchResult[], whenGiven: string) {
    userAPIService
      .setup(u => u.search(whenGiven))
      .returns(async () => returns);
  }
});
