import { async } from "@angular/core/testing";
import { SignupComponent } from "./signup.component";
import { IMock, Mock, Times, It } from "typemoq";
import { UserApiService } from "src/app/services/api/user-api.service";
import { SignInApiService } from "src/app/services/api/signin-api.service";
import { PasswordAPIService } from "src/app/services/api/password-api.service";
import { Router } from "@angular/router";
import { expectNothing } from "test-utils/expect-nothing";
import { ICreateUser } from "src/app/models/createuser.interface";
import { IError } from "src/app/services/api/error.interface";
import { IToken } from "src/app/models/token.interface";

describe("SignupComponent", () => {
  let userApiService: IMock<UserApiService>;
  let signInApiService: IMock<SignInApiService>;
  let passwordAPIService: IMock<PasswordAPIService>;
  let router: IMock<Router>;

  let subject: SignupComponent;

  beforeEach(async(() => {
    userApiService = Mock.ofType<UserApiService>();
    signInApiService = Mock.ofType<SignInApiService>();
    passwordAPIService = Mock.ofType<PasswordAPIService>();
    router = Mock.ofType<Router>();

    subject = new SignupComponent(userApiService.object, signInApiService.object, passwordAPIService.object, router.object);
  }));

  describe("usernameFocusOut", () => {

    it("should set a usernameError if the username is null", async () => {
      given_subject_username_equals(null);

      await subject.usernameFocusOut();

      expect(subject.usernameError).toBe("You need to enter a username");
    });

    it("should set a usernameError if the username is undefined", async () => {
      given_subject_username_equals(undefined);

      await subject.usernameFocusOut();

      expect(subject.usernameError).toBe("You need to enter a username");
    });

    it("should set a usernameError if the username is an empty string", async () => {
      given_subject_username_equals("");

      await subject.usernameFocusOut();

      expect(subject.usernameError).toBe("You need to enter a username");
    });

    it("should set a usernameError if the username contains punctuation", async () => {
      given_subject_username_equals("this has a . in it");

      await subject.usernameFocusOut();

      expect(subject.usernameError).toBe("Usernames can only contains numbers and letters");
    });

    it("should set a usernameError if the userApiService says the username is unavailable", async () => {
      const username = "ThisIsAUsername";

      given_subject_username_equals(username);
      given_userApiService_userExists_returnsWhenGiven(true, username);

      await subject.usernameFocusOut();

      expect(subject.usernameError).toBe("This username is not available");
    });

    it("should set the usernameError to nothing", async () => {
      const username = "ThisIsAUsername";

      given_subject_username_equals(username);
      given_userApiService_userExists_returnsWhenGiven(false, username);

      expect(subject.usernameError).toBe("");
    });
  });

  describe("nameFocusOut", () => {

    it("should set a nameError if not matching names and the name is null", async () => {
      given_subject_matchNames_equals(false);
      given_subject_name_equals(null);

      subject.nameFocusOut();

      expect(subject.nameError).toBe("You need to either enter a name or check 'Same as username'");
    });

    it("should set a nameError if not matching names and the name is undefined", async () => {
      given_subject_matchNames_equals(false);
      given_subject_name_equals(undefined);

      subject.nameFocusOut();

      expect(subject.nameError).toBe("You need to either enter a name or check 'Same as username'");
    });

    it("should set a nameError if not matching names and the name is an empty string", async () => {
      given_subject_matchNames_equals(false);
      given_subject_name_equals("");

      subject.nameFocusOut();

      expect(subject.nameError).toBe("You need to either enter a name or check 'Same as username'");
    });

    it("should set the nameError to nothing", async () => {
      const name = "ThisIsAName";

      given_subject_name_equals(name);

      expect(subject.nameError).toBe("");
    });
  });

  describe("emailFocusOut", () => {
    it("should set an emailError if the email is null", () => {
      given_subject_email_equals(null);

      subject.emailFocusOut();

      expect(subject.emailError).toBe("You need to enter an email");
    });

    it("should set an emailError if the email is undefined", () => {
      given_subject_email_equals(undefined);

      subject.emailFocusOut();

      expect(subject.emailError).toBe("You need to enter an email");
    });

    it("should set an emailError if the email is an empty string", () => {
      given_subject_email_equals("");

      subject.emailFocusOut();

      expect(subject.emailError).toBe("You need to enter an email");
    });

    [
      "thisHasNoAt.com",
      "thisHas@NoDomain",
      "@ThisHasNoLocalPart",
      ".ThisBegins@WithA.Dot",
      "This..Has@Consecutive.Dots",
      "This Contains@a.space"
    ].forEach((email) => it(`should set an emailError if the email isn't a standard email syntax: ${email}`, () => {
      given_subject_email_equals(email);

      subject.emailFocusOut();

      expect(subject.emailError).toBe("You need to enter a valid email");
    }));

    it("should set the emailError to nothing", async () => {
      given_subject_email_equals("this@is.valid");

      expect(subject.nameError).toBe("");
    });
  });

  describe("passwordFocusOut", () => {

    it("should set a passwordError if the password is null", async () => {
      given_subject_password_equals(null);

      await subject.passwordFocusOut();

      expect(subject.passwordError).toBe("You need to enter a password");
    });

    it("should set a passwordError if the password is undefined", async () => {
      given_subject_password_equals(undefined);

      await subject.passwordFocusOut();

      expect(subject.passwordError).toBe("You need to enter a password");
    });

    it("should set a passwordError if the password is an empty string", async () => {
      given_subject_password_equals("");

      await subject.passwordFocusOut();

      expect(subject.passwordError).toBe("You need to enter a password");
    });

    it("should set a passwordError if the password contains fewer than 8 characters", async () => {
      given_subject_password_equals("1234567");

      await subject.passwordFocusOut();

      expect(subject.passwordError).toBe("You need at least 8 characters");
    });

    [
      "ABCDEFGH",
      "ABCD1FGH",
      "ABCD!FGH"
    ].forEach(password => it(`should set a passwordError if the password doesn't contain any lowercase letters: ${password}`, async () => {
      given_subject_password_equals(password);

      await subject.passwordFocusOut();

      expect(subject.passwordError).toBe("You need at least 1 lowercase letter");
    }));

    [
      "abcdefgh",
      "abcd1fgh",
      "abcd!fgh"
    ].forEach(password => it(`should set a passwordError if the password doesn't contain any uppercase letters: ${password}`, async () => {
      given_subject_password_equals(password);

      await subject.passwordFocusOut();

      expect(subject.passwordError).toBe("You need at least 1 uppercase letter");
    }));

    [
      "Abcdefgh",
      "Abcd.fgh",
      "Abcd!fgh"
    ].forEach(password => it(`should set a passwordError if the password doesn't contain any numbers: ${password}`, async () => {
      given_subject_password_equals(password);

      await subject.passwordFocusOut();

      expect(subject.passwordError).toBe("You need at least 1 number");
    }));

    [
      "Abcd1fgh",
      "Abcd2fgh",
      "Abcd3fgh"
    ].forEach(password => it(`should set a passwordError if the password doesn't contain any punctuation: ${password}`, async () => {
      given_subject_password_equals(password);

      await subject.passwordFocusOut();

      expect(subject.passwordError).toBe("You need at least 1 punctuation");
    }));

    it("should call passwordApiService checkPassword with the given password", async () => {
      const password = "Abcd1fg!";

      given_subject_password_equals(password);

      await subject.passwordFocusOut();

      passwordAPIService.verify(p => p.checkPassword(password), Times.once());
      expectNothing();
    });

    [
      0,
      1,
      3562,
      -8
    ].forEach(times => it(`should set timesBreached to what the passwordApiService checkPassword returns: ${times}`, async () => {
      const password = "Abcd1fg!";

      given_subject_password_equals(password);
      given_passwordApiService_checkPassword_returnsWhenGiven(times, password);

      await subject.passwordFocusOut();

      expect(subject.timesBreached).toBe(times);
    }));

    it("should set the passwordError to nothing", async () => {
      const password = "Abcd1fg!";

      given_subject_password_equals(password);
      given_passwordApiService_checkPassword_returnsWhenGiven(0, password);

      await subject.passwordFocusOut();

      expect(subject.passwordError).toBe("");
    });
  });

  describe("matchingPasswords", () => {

    it("should return true if password strictly equals confirmPassword", () => {
      const oneThing = "This is one value";

      given_subject_password_equals(oneThing);
      given_subject_confirmPassword_equals(oneThing);

      const result = subject.matchingPasswords();

      expect(result).toBeTruthy();
    });

    it("should return true if password strictly equals confirmPassword", () => {
      const password = "We are";
      const notPassword = "different";

      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(notPassword);

      const result = subject.matchingPasswords();

      expect(result).toBeFalsy();
    });
  });

  describe("signup", async () => {

    it("should not create a user if the username is invalid", async () => {
      const username = "ThisIs NOT Valid";
      const name = "ThisIsValid";
      const email = "this@is.valid";
      const password = "This1IsValid!";

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);
      given_subject_timesBreached_equals(0);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(0, password);
      given_userApiService_createUser_returns(createdUser);

      await subject.signup();

      userApiService.verify(u => u.createUser(It.isAny(), It.isAny(), It.isAny(), It.isAny()), Times.never());
      expectNothing();
    });

    it("should not create a user if the name is invalid", async () => {
      const username = "ThisIsValid";
      const name = null;
      const email = "this@is.valid";
      const password = "This1IsValid!";

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);
      given_subject_timesBreached_equals(0);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(0, password);
      given_userApiService_createUser_returns(createdUser);

      await subject.signup();

      userApiService.verify(u => u.createUser(It.isAny(), It.isAny(), It.isAny(), It.isAny()), Times.never());
      expectNothing();
    });

    it("should not create a user if the email is invalid", async () => {
      const username = "ThisIsValid";
      const name = "this is valid";
      const email = "this..is@NOT.valid";
      const password = "This1IsValid!";

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);
      given_subject_timesBreached_equals(0);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(0, password);
      given_userApiService_createUser_returns(createdUser);

      await subject.signup();

      userApiService.verify(u => u.createUser(It.isAny(), It.isAny(), It.isAny(), It.isAny()), Times.never());
      expectNothing();
    });

    it("should not create a user if the password is invalid", async () => {
      const username = "ThisIsValid";
      const name = "this is valid";
      const email = "this@is.valid";
      const password = "ThisNOTIsValid!";

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);
      given_subject_timesBreached_equals(0);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(0, password);
      given_userApiService_createUser_returns(createdUser);

      await subject.signup();

      userApiService.verify(u => u.createUser(It.isAny(), It.isAny(), It.isAny(), It.isAny()), Times.never());
      expectNothing();
    });

    it("should not create a user if the passwords don't match", async () => {
      const username = "ThisIsValid";
      const name = "this is valid";
      const email = "this@is.valid";
      const password = "This1IsValid!";

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password + "different");
      given_subject_timesBreached_equals(0);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(0, password);
      given_userApiService_createUser_returns(createdUser);

      await subject.signup();

      userApiService.verify(u => u.createUser(It.isAny(), It.isAny(), It.isAny(), It.isAny()), Times.never());
      expectNothing();
    });

    it("should not create a user if the password is breached and the user doesn't understand the risks", async () => {
      const username = "ThisIsValid";
      const name = "this is valid";
      const email = "this@is.valid";
      const password = "This1IsValid!";
      const breaches = 4;

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(breaches, password);
      given_userApiService_createUser_returns(createdUser);

      await subject.signup();

      userApiService.verify(u => u.createUser(It.isAny(), It.isAny(), It.isAny(), It.isAny()), Times.never());
      expectNothing();
    });

    it("should create a user", async () => {
      const username = "ThisIsValid";
      const name = "this is valid";
      const email = "this@is.valid";
      const password = "This1IsValid!";
      const breaches = 0;

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      const token = {
        token: "This is a token"
      } as IToken;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(breaches, password);
      given_userApiService_createUser_returns(createdUser);
      given_signInApiService_signin_returns(token);

      await subject.signup();

      userApiService.verify(u => u.createUser(username, name, email, password), Times.once());
      expectNothing();
    });

    it("should create a user with the display name if names are not set to match", async () => {
      const username = "ThisIsValid";
      const name = "this is valid";
      const email = "this@is.valid";
      const password = "This1IsValid!";
      const breaches = 0;
      const matchingNames = false;

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);
      given_subject_matchNames_equals(matchingNames);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      const token = {
        token: "This is a token"
      } as IToken;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(breaches, password);
      given_userApiService_createUser_returns(createdUser);
      given_signInApiService_signin_returns(token);

      await subject.signup();

      userApiService.verify(u => u.createUser(It.isAny(), name, It.isAny(), It.isAny()), Times.once());
      expectNothing();
    });

    it("should create a user with the username if names are set to match", async () => {
      const username = "ThisIsValid";
      const name = "this is valid";
      const email = "this@is.valid";
      const password = "This1IsValid!";
      const breaches = 0;
      const matchingNames = true;

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);
      given_subject_matchNames_equals(matchingNames);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      const token = {
        token: "This is a token"
      } as IToken;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(breaches, password);
      given_userApiService_createUser_returns(createdUser);
      given_signInApiService_signin_returns(token);

      await subject.signup();

      userApiService.verify(u => u.createUser(It.isAny(), username, It.isAny(), It.isAny()), Times.once());
      expectNothing();
    });

    it("should set a form error if the userApiService returns one", async () => {
      const username = "ThisIsValid";
      const name = "this is valid";
      const email = "this@is.valid";
      const password = "This1IsValid!";
      const breaches = 0;
      const errorMessage = "This is an errror message";

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);

      const createdUser = {
        error: errorMessage
      } as IError;

      const token = {
        token: "This is a token"
      } as IToken;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(breaches, password);
      given_userApiService_createUser_returns(createdUser);
      given_signInApiService_signin_returns(token);

      await subject.signup();

      expect(subject.formError).toBe(errorMessage);
    });

    it("should set a form error if the signinApiService returns one", async () => {
      const username = "ThisIsValid";
      const name = "this is valid";
      const email = "this@is.valid";
      const password = "This1IsValid!";
      const breaches = 0;
      const errorMessage = "This is an errror message";

      given_subject_username_equals(username);
      given_subject_name_equals(name);
      given_subject_email_equals(email);
      given_subject_password_equals(password);
      given_subject_confirmPassword_equals(password);

      const createdUser = {
        displayName: "This is some data"
      } as ICreateUser;

      const token = {
        error: errorMessage
      } as IError;

      given_userApiService_userExists_returnsWhenGiven(false, username);
      given_passwordApiService_checkPassword_returnsWhenGiven(breaches, password);
      given_userApiService_createUser_returns(createdUser);
      given_signInApiService_signin_returns(token);

      await subject.signup();

      expect(subject.formError).toBe(errorMessage);
    });
  });

  function given_subject_username_equals(equals: string) {
    subject.username = equals;
  }

  function given_subject_name_equals(equals: string) {
    subject.name = equals;
  }

  function given_subject_matchNames_equals(equals: boolean) {
    subject.matchNames = equals;
  }

  function given_subject_email_equals(equals: string) {
    subject.email = equals;
  }

  function given_subject_password_equals(equals: string) {
    subject.password = equals;
  }

  function given_subject_confirmPassword_equals(equals: string) {
    subject.confirmPassword = equals;
  }

  function given_subject_timesBreached_equals(equals: number) {
    subject.timesBreached = equals;
  }

  function given_userApiService_userExists_returnsWhenGiven(returns: boolean, whenGiven: string) {
    userApiService
      .setup(u => u.userExists(whenGiven))
      .returns(async () => returns);
  }

  function given_passwordApiService_checkPassword_returnsWhenGiven(returns: number, whenGiven: string) {
    passwordAPIService
      .setup(p => p.checkPassword(whenGiven))
      .returns(async () => returns);
  }

  function given_userApiService_createUser_returns(returns: ICreateUser | IError) {
    userApiService
      .setup(u => u.createUser(It.isAny(), It.isAny(), It.isAny(), It.isAny()))
      .returns(async () => returns);
  }

  function given_signInApiService_signin_returns(returns: IToken | IError) {
    signInApiService
      .setup(s => s.signIn(It.isAny()))
      .returns(async () => returns);
  }
});
