import { IMock, Mock, It, Times } from "typemoq";
import { IRouter, Router } from "express";
import { assert } from "chai";
import { SearchController } from "../../../src/contollers/search.controller";
import { SearchRoute } from "../../../src/api/routes/search.route";

describe("In the search route", async () => {
  let router: IMock<IRouter>;
  let searchController: IMock<SearchController>;

  let subject: SearchRoute;

  beforeEach(() => {
    router = Mock.ofType<Router>();
    searchController = Mock.ofType<SearchController>();

    subject = new SearchRoute(router.object, searchController.object);
  });

  describe("setupRoutes", async () => {

    it("should set up the get route at /search/:term", async () => {
      subject.setupRoutes();
      router.verify(r => r.get("/search/:term", It.isAny()), Times.once());
    });
  });

  describe("getRouter", () => {
    it("should return the router", () => {
      assert.deepStrictEqual(subject.getRouter(), router.object);
    });
  });
});
