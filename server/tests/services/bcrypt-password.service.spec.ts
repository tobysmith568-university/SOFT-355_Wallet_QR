import { assert } from "chai";
import { BcryptPasswordService } from "../../src/services/implementations/bcrypt-password.service";

describe("In the bcrypt password service", async () => {

  let subject: BcryptPasswordService;

  beforeEach(() => {
    subject = new BcryptPasswordService();
  });

  describe("hash", async () => {

    [
      "ThisIsMyPassword",
      "password123",
      "CorrectHorseBatteryStaple",
    ].forEach((password) => {

      it(`should hash the password ${password} to a full length of 60`, async () => {

        const result = await subject.hash(password);
  
        assert.equal(result.length, 60);
      });

      it(`should hash the password ${password} with the prefix $2b`, async () => {
        
        const result = await subject.hash(password);

        const parts = result.split(/[\$]+/);

        assert.equal(parts[1], "2b");
      });

      it(`should hash the password ${password} with the cost 10`, async () => {

        const result = await subject.hash(password);

        const parts = result.split(/[\$]+/);

        assert.equal(parts[2], "10");
      });
    });
  });

  describe("validate", async () => {

    [
      { password: "ThisIsMyPassword", hash: "$2b$10$zg8J0Nn7QyD0SmeydN7QpefL8I6tylclt8N20BI8zQ4pkKf3KbCaq"},
      { password: "password123", hash: "$2b$10$dzuW/4bErGDA2n9mxN1iCuypWb7S4Qnfr4Pf/4fctTyt9X8tfjOOa"},
      { password: "CorrectHorseBatteryStaple", hash: "$2b$10$6LP17bgx7C74sRM0/xmbse3lnOmDrkeL0ct8TdBJpgg0v1oITQcjS"},
    ].forEach((pair) => it(`should validate the password ${pair.password}`, async () => {

      const result = await subject.validate(pair.password, pair.hash);

      assert.isTrue(result);
    }));
  });
});
