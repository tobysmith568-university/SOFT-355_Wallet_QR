import { IMock, Mock, Times, It } from "typemoq";
import { Request, Response } from "express";
import { ITokenService } from "../../src/services/token.service.interface";
import { UserRepository } from "../../src/database/repositories/user.repository";
import { VerifyController } from "../../src/contollers/verify.controller";
import { assert } from "chai";
import { ParamsDictionary } from "express-serve-static-core";
import { IUserDbo } from "../../src/database/models/user.dbo.interface";

describe("In the verify controller", () => {

  let tokenService: IMock<ITokenService>;
  let userRepository: IMock<UserRepository>;

  let subject: VerifyController;

  let req: IMock<Request>;
  let res: IMock<Response>;

  beforeEach(() => {
    tokenService = Mock.ofType<ITokenService>();
    userRepository = Mock.ofType<UserRepository>();

    subject = new VerifyController(tokenService.object, userRepository.object);

    req = Mock.ofType<Request>();
    res = Mock.ofType<Response>();
  });

  describe("verify", () => {

    it("should not be null", () => {
      assert.isNotNull(subject.verify);
    });

    it("should return an error message if the token is null", async () => {
      given_req_params_has("token", null as unknown as string);

      await subject.verify(req.object, res.object);

      res.verify(r => r.send("<h1>The URL is missing a token!</h1>"), Times.once());
    });

    it("should return a 401 status code if the token is null", async () => {
      given_req_params_has("token", null as unknown as string);

      await subject.verify(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message if the token is undefined", async () => {
      given_req_params_has("token", undefined as unknown as string);

      await subject.verify(req.object, res.object);

      res.verify(r => r.send("<h1>The URL is missing a token!</h1>"), Times.once());
    });

    it("should return a 401 status code if the token is undefined", async () => {
      given_req_params_has("token", undefined as unknown as string);

      await subject.verify(req.object, res.object);

      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message if the payload returns as null", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(null, token);

      await subject.verify(req.object, res.object);
      
      res.verify(r => r.send("<h1>The given token is invalid</h1>"), Times.once());
    });

    it("should return a 401 status code if the payload returns as null", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(null, token);

      await subject.verify(req.object, res.object);
      
      assert.deepStrictEqual(res.target.statusCode, 401);
    });
    
    it("should return an error message if the payload returns as undefined", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(undefined as unknown as string, token);

      await subject.verify(req.object, res.object);
      
      res.verify(r => r.send("<h1>The given token is invalid</h1>"), Times.once());
    });

    it("should return a 401 status code if the payload returns as undefined", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(undefined as unknown as string, token);

      await subject.verify(req.object, res.object);
      
      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message if the payload is a string", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven("any string", token);

      await subject.verify(req.object, res.object);
      
      res.verify(r => r.send("<h1>The given token is an invalid type</h1>"), Times.once());
    });

    it("should return a 401 status code if the payload is a string", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven("any string", token);

      await subject.verify(req.object, res.object);
      
      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message if the payload has no usr field", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      const payload = {
        use: "activation",
        notUsr: "this isn't a usr field"
      };
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);

      await subject.verify(req.object, res.object);
      
      res.verify(r => r.send("<h1>The given token is not assigned to a user</h1>"), Times.once());
    });

    it("should return a 401 status code if the payload has no usr field", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      const payload = {
        use: "activation",
        notUsr: "this isn't a usr field"
      };
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);

      await subject.verify(req.object, res.object);
      
      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should return an error message if the payload has no use field", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      const payload = {
        usr: "username",
        notUse: "this isn't a use field"
      };
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);

      await subject.verify(req.object, res.object);
      
      res.verify(r => r.send("<h1>The given token is not for this use</h1>"), Times.once());
    });

    it("should return a 401 status code if the payload has no use field", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      const payload = {
        usr: "username",
        notUse: "this isn't a use field"
      };
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);

      await subject.verify(req.object, res.object);
      
      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    [
      "",
      "notActivation",
      "Activation"
    ].forEach((value) => it(`should return an error message if the payload use field equals '${value}', not 'activation'`, async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      const payload = {
        usr: "username",
        use: value
      };
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);

      await subject.verify(req.object, res.object);
      
      res.verify(r => r.send("<h1>The given token is not for this use</h1>"), Times.once());
    }));

    [
      "",
      "notActivation",
      "Activation"
    ].forEach((value) => it(`should return a 401 status code if the payload use field equals '${value}', not 'activation'`, async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";

      const payload = {
        usr: "username",
        use: value
      };
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);

      await subject.verify(req.object, res.object);
      
      assert.deepStrictEqual(res.target.statusCode, 401);
    }));

    it("should return an error message if the user repository returns no results", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";
      const username = "This is my username";
      
      const payload = {
        usr: username,
        use: "activation"
      };
      
      const userSearch = {
        username: username
      } as Partial<IUserDbo>;
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);
      given_userRepository_find_returns_when_given([], userSearch);

      await subject.verify(req.object, res.object);
      
      res.verify(r => r.send("<h1>This account no longer exists</h1>"), Times.once());
    });

    it("should return a 401 status code if the user repository returns no results", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";
      const username = "This is my username";
      
      const payload = {
        usr: username,
        use: "activation"
      };
      
      const userSearch = {
        username: username
      } as Partial<IUserDbo>;
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);
      given_userRepository_find_returns_when_given([], userSearch);

      await subject.verify(req.object, res.object);
      
      assert.deepStrictEqual(res.target.statusCode, 401);
    });

    it("should set the emailVerified field to true on the found user", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";
      const username = "This is my username";
      
      const payload = {
        usr: username,
        use: "activation"
      };
      
      const userSearch = {
        username: username
      } as Partial<IUserDbo>;

      const user = Mock.ofType<IUserDbo>();
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);
      given_userRepository_find_returns_when_given([ user.object ], userSearch);

      await subject.verify(req.object, res.object);
      
      assert.deepStrictEqual(user.target.emailVerified, true);
    });

    it("should call save() on the found user", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";
      const username = "This is my username";
      
      const payload = {
        usr: username,
        use: "activation"
      };
      
      const userSearch = {
        username: username
      } as Partial<IUserDbo>;

      const user = Mock.ofType<IUserDbo>();
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);
      given_userRepository_find_returns_when_given([ user.object ], userSearch);

      await subject.verify(req.object, res.object);
      
      user.verify(u => u.save(), Times.once());
    });

    it("should redirect to the user's profile", async () => {
      const base64token = "VGhpcyBpcyBteSB0b2tlbg==";
      const token = "This is my token";
      const username = "This is my username";
      
      const payload = {
        usr: username,
        use: "activation"
      };
      
      const userSearch = {
        username: username
      } as Partial<IUserDbo>;

      const user = Mock.ofType<IUserDbo>();
      
      given_req_params_has("token", base64token);
      given_tokenService_verify_returns_whenGiven(payload, token);
      given_userRepository_find_returns_when_given([ user.object ], userSearch);

      await subject.verify(req.object, res.object);
      
      res.verify(r => r.redirect(It.is((value) => value.endsWith("/@" + username))), Times.once());
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

  function given_tokenService_verify_returns_whenGiven(returns: string | object | null, whenGiven: string) {
    tokenService
      .setup(t => t.verify(whenGiven))
      .returns(async () => returns);
  }

  function given_userRepository_find_returns_when_given(returns: IUserDbo[], whenGiven: Partial<IUserDbo>) {
    userRepository
      .setup(u => u.find(whenGiven))
      .returns(async () => returns);
  }
});
