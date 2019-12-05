import { IMock, Mock, Times } from "typemoq";
import { TokenAuthenticator } from "../../src/middlewares/token-authenticator";
import { ITokenService } from "../../src/services/token.service.interface";
import { Express, Request, Response, NextFunction } from "express";
import { assert } from "chai";

describe("In the token authenticator middleware", async () => {

  let tokenService: IMock<ITokenService>;

  let subject: TokenAuthenticator;

  let req: IMock<Request>;
  let res: IMock<Response>;
  let next: IMock<NextFunction>;

  beforeEach(() => {
    tokenService = Mock.ofType<ITokenService>();

    subject = new TokenAuthenticator(tokenService.object);

    req = Mock.ofType<Request>();
    res = Mock.ofType<Response>();
    next = Mock.ofType<NextFunction>();
  });

  describe("middleware", async () => {

    it("should not be null", () => {
      const middleware = subject.middleware();

      assert.isNotNull(middleware);
    });

    it("should return an error message if there is no authorization header", async () => {
      const middleware = subject.middleware();
      await middleware(req.object, res.object, next.object);

      res.verify(r => r.json({ error: "You are not authenticated" }), Times.once());
    });

    it("should return a status of 401 if there is no authorization header", async () => {
      const middleware = subject.middleware();
      await middleware(req.object, res.object, next.object);

      assert.equal(res.target.statusCode, 401);
    });

    it("should return an error message if there the authorization header is not 2 words", async () => {
      given_req_headers_authorization_equals("ThisIsAllOneWord");

      const middleware = subject.middleware();
      await middleware(req.object, res.object, next.object);

      res.verify(r => r.json({ error: "Your authorization header is not a bearer token" }), Times.once());
    });

    it("should return a status of 401 if there the authorization header is not 2 words", async () => {
      given_req_headers_authorization_equals("ThisIsAllOneWord");

      const middleware = subject.middleware();
      await middleware(req.object, res.object, next.object);

      assert.equal(res.target.statusCode, 401);
    });

    it("should return an error message if there the authorization header is not a bearer token", async () => {
      given_req_headers_authorization_equals("ThisIsAllOneWord");

      const middleware = subject.middleware();
      await middleware(req.object, res.object, next.object);

      res.verify(r => r.json({ error: "Your authorization header is not a bearer token" }), Times.once());
    });

    it("should return a status of 401 if there the authorization header is not a bearer token", async () => {
      given_req_headers_authorization_equals("ThisIsAllOneWord");

      const middleware = subject.middleware();
      await middleware(req.object, res.object, next.object);

      assert.equal(res.target.statusCode, 401);
    });

    it("should return an error message if the token is invalid", async () => {
      const token = "ThisIsMyToken";

      given_req_headers_authorization_equals("Bearer " + token);
      given_tokenService_verify_returns_whenGiven(null, token);

      const middleware = subject.middleware();
      await middleware(req.object, res.object, next.object);

      res.verify(r => r.json({ error: "Your token is invalid" }), Times.once());
    });

    it("should return a status of 401 if the token is invalid", async () => {
      const token = "ThisIsMyToken";

      given_req_headers_authorization_equals("Bearer " + token);
      given_tokenService_verify_returns_whenGiven(null, token);

      const middleware = subject.middleware();
      await middleware(req.object, res.object, next.object);

      assert.equal(res.target.statusCode, 401);
    });

    it("should set the username on the req when the token is valid", async () => {
      const username = "ThisIsMyUsername";
      const token = "ThisIsMyToken";

      given_req_headers_authorization_equals("Bearer " + token);
      given_tokenService_verify_returns_whenGiven(username, token);

      const middleware = subject.middleware();
      await middleware(req.object, res.object, next.object);

      assert.equal(req.target.username, username);
    });
  });

  function given_req_headers_authorization_equals(data: string) {
    const headers = req.object.headers;
    headers.authorization = data;
    req
      .setup(r => r.headers)
      .returns(() => headers);
  }

  function given_tokenService_verify_returns_whenGiven(returns: string | null, whenGiven: string) {
    tokenService
      .setup(t => t.verify(whenGiven))
      .returns(async () => returns);
  }
});
