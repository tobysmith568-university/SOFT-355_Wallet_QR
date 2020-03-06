import { assert } from "chai";
import { Request, Response } from "express";
import { IMock, Mock, Times, It } from "typemoq";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { SearchController } from "../../src/contollers/search.controller";
import { IUserDbo } from "../../src/database/models/user.dbo.interface";
import { ISearchResult } from "../../src/api/models/search-result.interface";
import { ParamsDictionary } from "express-serve-static-core";
import { WalletController } from "../../src/contollers/wallet.controller";
import { IWallet } from "../../src/api/models/wallet.interface";
import { IWalletDbo } from "../../src/database/models/wallet.dbo.interface";

describe("In the wallet controller", () => {

  let userRepository: IMock<UserRepository>;

  let subject: WalletController;

  let req: IMock<Request>;
  let res: IMock<Response>;

  beforeEach(() => {
    userRepository = Mock.ofType<UserRepository>();

    subject = new WalletController(userRepository.object);

    req = Mock.ofType<Request>();
    res = Mock.ofType<Response>();
  });

  describe("create", () => {
    
    it("should not be null", () => {
      assert.isNotNull(subject.create);
    });

    it("should return an error message when the user is not logged in", async () => {

      await subject.create(req.object, res.object);

      res.verify(r => r.json({ error: "You are not logged in" }), Times.once());
    });

    it("should return a status code of 401 when the user is not logged in", async () => {

      await subject.create(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message when a wallet address is not given", async () => {
      const username = "This is a username";

      given_req_username_equals(username);

      await subject.create(req.object, res.object);

      res.verify(r => r.json({ error: "Wallet address was not given" }), Times.once());
    });

    it("should return a status code of 401 when a wallet address is not given", async () => {
      const username = "This is a username";

      given_req_username_equals(username);

      await subject.create(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message when a wallet currency is not given", async () => {
      const username = "This is a username";

      given_req_username_equals(username);
      given_req_body_equals({
        address: "This is an address"
      });

      await subject.create(req.object, res.object);

      res.verify(r => r.json({ error: "Wallet currency was not given" }), Times.once());
    });

    it("should return a status code of 401 when a wallet currency is not given", async () => {
      const username = "This is a username";

      given_req_username_equals(username);
      given_req_body_equals({
        address: "This is an address"
      });

      await subject.create(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message when the user's account cannot be found", async () => {
      const username = "This is a username";

      given_req_username_equals(username);
      given_req_body_equals({
        address: "This is an address",
        currency: "This is a currency"
      });
      given_userRepository_find_returnsWhenGivenUsername([], username);

      await subject.create(req.object, res.object);

      res.verify(r => r.json({ error: "This account no longer exists" }), Times.once());
    });

    it("should return a status code of 401 when the user's account cannot be found", async () => {
      const username = "This is a username";

      given_req_username_equals(username);
      given_req_body_equals({
        address: "This is an address",
        currency: "This is a currency"
      });
      given_userRepository_find_returnsWhenGivenUsername([], username);

      await subject.create(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return a status code of 201 when a wallet is added", async () => {
      const username = "This is a username";

      const user: IMock<IUserDbo> = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.wallets)
        .returns(() => []);

      given_req_username_equals(username);
      given_req_body_equals({
        address: "This is an address",
        currency: "This is a currency"
      });
      given_userRepository_find_returnsWhenGivenUsername([ user.object ], username);

      await subject.create(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 201);
    });

    it("should successfully add a wallet to the found user", async () => {
      const username = "This is a username";
      const wallet = {
        address: "This is an address",
        currency: "This is a currency"
      };

      const mockedWalletArray: IWalletDbo[] = [];

      const user: IMock<IUserDbo> = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.wallets)
        .returns(() => mockedWalletArray);

      given_req_username_equals(username);
      given_req_body_equals(wallet);
      given_userRepository_find_returnsWhenGivenUsername([ user.object ], username);

      await subject.create(req.object, res.object);

      assert.deepStrictEqual(mockedWalletArray, [
        {
          name: "",
          address: "This is an address",
          currency: "This is a currency"
        } as IWalletDbo
      ]);
    });

    it("should successfully add a wallet to the found user", async () => {
      const username = "This is a username";
      const wallet = {
        address: "This is an address",
        currency: "This is a currency"
      };

      const mockedWalletArray: IWalletDbo[] = [];

      const user: IMock<IUserDbo> = Mock.ofType<IUserDbo>();
      user
        .setup(u => u.wallets)
        .returns(() => mockedWalletArray);

      given_req_username_equals(username);
      given_req_body_equals(wallet);
      given_userRepository_find_returnsWhenGivenUsername([ user.object ], username);

      await subject.create(req.object, res.object);

      assert.deepStrictEqual(mockedWalletArray, [
        {
          name: "",
          address: "This is an address",
          currency: "This is a currency"
        } as IWalletDbo
      ]);
    });
  });

  function given_req_username_equals(equals: string) {
    req
      .setup(r => r.username)
      .returns(() => equals);
  }

  function given_req_body_equals(equals: any) {
    req
      .setup(r => r.body)
      .returns(() => equals);
  }

  function given_userRepository_find_returnsWhenGivenUsername(returns: IUserDbo[], whenGiven: string) {
    userRepository
      .setup(u => u.find({ username: whenGiven }))
      .returns(async () => returns);
  }
});
