import { TestBed } from "@angular/core/testing";
import { ApiService } from "./api.service";
import { HttpClient } from "@angular/common/http";
import { Mock, It, IMock } from "typemoq";
import { IUser } from "src/app/models/user.interface";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

describe("ApiService", () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const user: IUser = {
      email: "thisIsMyEmail",
      name: "thisIsMyName",
      username: "thisIsMyUsername",
      wallets: [
        {
          address: "thisIsAnAddress",
          currency: "thisIsACurrency",
          name: "thisIsAName"
        }
      ]
    } as IUser;

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        ApiService
      ]
    });
  });

  it("should be created", () => {
    const service: ApiService = TestBed.get(ApiService);
    expect(service).toBeTruthy();
  });
});
