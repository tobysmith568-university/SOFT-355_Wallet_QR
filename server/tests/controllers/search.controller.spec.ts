import { assert } from "chai";
import { Request, Response } from "express";
import { IMock, Mock, Times, It } from "typemoq";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { SearchController } from "../../src/contollers/search.controller";
import { IUserDbo } from "../../src/database/models/user.dbo.interface";
import { ISearchResult } from "../../src/api/models/search-result.interface";
import { ParamsDictionary } from "express-serve-static-core";

describe("In the search controller", () => {

  let userRepository: IMock<UserRepository>;

  let subject: SearchController;

  let req: IMock<Request>;
  let res: IMock<Response>;

  beforeEach(() => {
    userRepository = Mock.ofType<UserRepository>();

    subject = new SearchController(userRepository.object);

    req = Mock.ofType<Request>();
    res = Mock.ofType<Response>();
  });

  describe("search", () => {

    it("should not be null", () => {
      assert.isNotNull(subject.search);
    });

    it("should return an error message when no search term is given", async () => {
      await subject.search(req.object, res.object);

      res.verify(r => r.json({ error: "No search term given" }), Times.once());
    });

    it("should return a status code of 401 when no search term is given", async () => {
      await subject.search(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an empty array when no search results are found", async () => {
      const term = "This is a search term";

      given_req_params_has("term", term);
      given_userRepository_search_returnsWhenGiven([], term);

      await subject.search(req.object, res.object);

      res.verify(r => r.json([]), Times.once());
    });

    it("should return a result for each found user", async () => {
      const term = "This is a search term";
      const foundUsers: IUserDbo[] = [
        {
          displayName: "This is a display name 1",
          username: "This is a username 1"
        },
        {
          displayName: "This is a display name 2",
          username: "This is a display name 2",
        }
      ] as IUserDbo[];

      given_req_params_has("term", term);
      given_userRepository_search_returnsWhenGiven(foundUsers, term);

      await subject.search(req.object, res.object);

      res.verify(r => r.json([
        {
          name: foundUsers[0].displayName,
          username: foundUsers[0].username
        },
        {
          name: foundUsers[1].displayName,
          username: foundUsers[1].username
        }
      ] as ISearchResult[]), Times.once());
    });
  });

  function given_req_params_has(key: string, value: string) {
    const params = Mock.ofType<ParamsDictionary>();
    params
      .setup(t => t[key])
      .returns(() => value);

    req
      .setup(r => r.params)
      .returns(() => params.object);
  }

  function given_userRepository_search_returnsWhenGiven(returns: IUserDbo[], whenGiven: string) {
    userRepository
      .setup(u => u.search(whenGiven, It.isAny()))
      .returns(async () => returns);
  }
});
