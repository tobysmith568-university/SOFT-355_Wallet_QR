import { HomeComponent } from "./home.component";
import { IMock, Mock } from "typemoq";
import { StorageService } from "src/app/services/storage.service";

describe("HomeComponent", () => {
  let storageService: IMock<StorageService>;

  let subject: HomeComponent;

  beforeEach(() => {
    storageService = Mock.ofType<StorageService>();

    subject = new HomeComponent(storageService.object);
  });

  describe("ngOnInit", () => {

    it("should set signedIn to true if the stored username is valid", () => {
      given_storageService_get_returnsWhenGiven("anything", "username");

      subject.ngOnInit();

      expect(subject.signedIn).toBeTruthy();
    });

    it("should set signedIn to false is the stored username is null", () => {
      given_storageService_get_returnsWhenGiven(null, "username");

      subject.ngOnInit();

      expect(subject.signedIn).toBeFalsy();
    });

    it("should set signedIn to false is the stored username is undefined", () => {
      given_storageService_get_returnsWhenGiven(undefined, "username");

      subject.ngOnInit();

      expect(subject.signedIn).toBeFalsy();
    });

    it("should set signedIn to false is the stored username is an empty string", () => {
      given_storageService_get_returnsWhenGiven("", "username");

      subject.ngOnInit();

      expect(subject.signedIn).toBeFalsy();
    });
  });

  function given_storageService_get_returnsWhenGiven(returns: string, whenGiven: string) {
    storageService
      .setup(s => s.get(whenGiven))
      .returns(() => returns);
  }
});
