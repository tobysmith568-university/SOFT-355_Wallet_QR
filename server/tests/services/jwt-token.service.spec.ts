import { assert } from "chai";
import { set } from "mockdate";
import { JWTTokenService } from "../../src/services/implementations/jwt-token.service";
import { Config } from "../../src/config/config";
import { IMock, Mock } from "typemoq";

describe("In the JWT token service", async () => {

  let config: IMock<Config>;

  let subject: JWTTokenService;

  beforeEach(() => {
    config = Mock.ofType<Config>();

    subject = new JWTTokenService(config.object);
  });

  describe("create", async () => {

    it("should create tokens using the JWT type", async () => {
      given_config_getTokenSecret_returns("anything");

      const result = await subject.create("myUsername", "14 days");
      
      const parts = result.split(/[\.]+/);
      const header = JSON.parse(Buffer.from(parts[0], "base64").toString("ascii"));

      assert.equal(header.typ, "JWT");
    });

    it("should create tokens using the HS256 algorithm", async () => {
      given_config_getTokenSecret_returns("anything");

      const result = await subject.create("myUsername", "14 days");
      
      const parts = result.split(/[\.]+/);
      const header = JSON.parse(Buffer.from(parts[0], "base64").toString("ascii"));

      assert.equal(header.alg, "HS256");
    });

    [
      "myUsername",
      "aDifferentUsername",
      "aThirdUsername"
    ].forEach((username) => it(`should create a token using ${username} for usr`, async () => {
      given_config_getTokenSecret_returns("anything");

      const result = await subject.create(username, "14 days");
      
      const parts = result.split(/[\.]+/);
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("ascii"));

      assert.equal(payload.usr, username);
    }));

    it("should create tokens using the current time issued", async () => {
      const unixTimestamp = 1575541800;

      given_config_getTokenSecret_returns("anything");
      given_theCurrentUnixTimestamp_is(unixTimestamp);

      const result = await subject.create("myUsername", "14 days");
      
      const parts = result.split(/[\.]+/);
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("ascii"));

      assert.equal(payload.iat, unixTimestamp);
    });

    [
      { currentTime: 1575541800, timeDuration: "14 days", thenTime: 1576751400 },
      { currentTime: 1575541800, timeDuration: "1 hour", thenTime: 1575545400 },
      { currentTime: 1575541800, timeDuration: "30 minutes", thenTime: 1575543600 },
    ].forEach((data) => it(`should create tokens with a correct expiry for ${data.timeDuration}`, async () => {
      given_config_getTokenSecret_returns("anything");
      given_theCurrentUnixTimestamp_is(data.currentTime);

      const result = await subject.create("myUsername", data.timeDuration);
      
      const parts = result.split(/[\.]+/);
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("ascii"));

      assert.equal(payload.exp, data.thenTime);
    }));

    [
      { key: "dtr", value: "This is some data" },
      { key: "vld", value: "This is some validation data" },
      { key: "dmy", value: "This is some dummy data" }
    ].forEach((pair) => it(`should create a token with the additional payload key ${pair.key}`, async () => {

      given_config_getTokenSecret_returns("anything");
      given_theCurrentUnixTimestamp_is(1575541800);

      const map = new Map<string, string>();
      map.set(pair.key, pair.value);

      const result = await subject.create("myUsername", "1 hour", map);
      
      const parts = result.split(/[\.]+/);
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("ascii"));

      assert.equal(payload[pair.key], pair.value);
    }));

    [
      { username: "myUsername", signature: "8VBMqfWLUto27goIE93kf-it_3eEPSZ5qFNLBLKSe3M" },
      { username: "aDifferentUsername", signature: "lYUspv9Jpw1PnEzHMXItH3ducnWLTCVPdBENncb9XAg" },
      { username: "aThirdUsername", signature: "t1B9Wr9U2sViaMtfvS7-wddkIddOIU0obWhxbGJhVAs" }
    ].forEach((pair) => it(`should create a token with a correct signature for username ${pair.username}`, async () => {

      given_config_getTokenSecret_returns("anything");
      given_theCurrentUnixTimestamp_is(1575541800);

      const result = await subject.create(pair.username, "14 days");

      const parts = result.split(/[\.]+/);
      const signature = parts[2];

      assert.equal(signature, pair.signature);
    }));

  });

  describe("verify", async () => {
    [
      { username: "myUsername", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJteVVzZXJuYW1lIiwiaWF0IjoxNTc1NTQxODAwLCJleHAiOjE1NzY3NTE0MDB9.8VBMqfWLUto27goIE93kf-it_3eEPSZ5qFNLBLKSe3M" },
      { username: "aDifferentUsername", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJhRGlmZmVyZW50VXNlcm5hbWUiLCJpYXQiOjE1NzU1NDE4MDAsImV4cCI6MTU3Njc1MTQwMH0.lYUspv9Jpw1PnEzHMXItH3ducnWLTCVPdBENncb9XAg" },
      { username: "aThirdUsername", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJhVGhpcmRVc2VybmFtZSIsImlhdCI6MTU3NTU0MTgwMCwiZXhwIjoxNTc2NzUxNDAwfQ.t1B9Wr9U2sViaMtfvS7-wddkIddOIU0obWhxbGJhVAs" }
    ].forEach((pair) => it("should return an object from a valid JWT", async () => {
      given_config_getTokenSecret_returns("anything");

      const result = await subject.verify(pair.token);

      assert.equal(typeof result, "object");
    }));

    [
      { username: "myUsername", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJteVVzZXJuYW1lIiwiaWF0IjoxNTc1NTQxODAwLCJleHAiOjE1NzY3NTE0MDB9.8VBMqfWLUto27goIE93kf-it_3eEPSZ5qFNLBLKSe3M" },
      { username: "aDifferentUsername", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJhRGlmZmVyZW50VXNlcm5hbWUiLCJpYXQiOjE1NzU1NDE4MDAsImV4cCI6MTU3Njc1MTQwMH0.lYUspv9Jpw1PnEzHMXItH3ducnWLTCVPdBENncb9XAg" },
      { username: "aThirdUsername", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJhVGhpcmRVc2VybmFtZSIsImlhdCI6MTU3NTU0MTgwMCwiZXhwIjoxNTc2NzUxNDAwfQ.t1B9Wr9U2sViaMtfvS7-wddkIddOIU0obWhxbGJhVAs" }
    ].forEach((pair) => it("should return an object containing the username from a valid JWT", async () => {
      given_config_getTokenSecret_returns("anything");

      const result = await subject.verify(pair.token);

      const objectResult = result as any;

      assert.equal(typeof objectResult.usr, pair.username);
    }));
    
    [
      { secret: "incorrect", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJteVVzZXJuYW1lIiwiaWF0IjoxNTc1NTQxODAwLCJleHAiOjE1NzY3NTE0MDB9.I4t96Mvsky30Cl5FTheH3r36JuoUZoc166Jbk6yiuCg" },
      { secret: "anything1", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJteVVzZXJuYW1lIiwiaWF0IjoxNTc1NTQxODAwLCJleHAiOjE1NzY3NTE0MDB9.vKAAjeEnl_Bm-ATgX08JUxj6t1voneRr98bijJHBZoI" },
      { secret: "", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJteVVzZXJuYW1lIiwiaWF0IjoxNTc1NTQxODAwLCJleHAiOjE1NzY3NTE0MDB9.5XmWNTgdvzLszjr7bHUOTNTXXKseEoB6e-ZaLxUCxPI" }
    ].forEach((pair) => it(`should return null from a JWT with the incorrect secret: ${pair.secret}`, async () => {
      given_config_getTokenSecret_returns("anything");

      const result = await subject.verify(pair.token);

      assert.equal(result, null);
    }));
  });

  function given_config_getTokenSecret_returns(data: string) {
    config
      .setup(c => c.getTokenSecret())
      .returns(() => data);
  }

  function given_theCurrentUnixTimestamp_is(seconds: number) {
    set(new Date(seconds * 1000));
  }
});
