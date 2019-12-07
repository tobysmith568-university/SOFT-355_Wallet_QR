import { TestBed } from "@angular/core/testing";
import { UserApiService } from "./user-api.service";
import { ApiService } from "./api.service";
import { Mock, IMock } from "typemoq";

describe("UserApiService", () => {
  let apiService: IMock<ApiService>;

  beforeEach(() => {
    apiService = Mock.ofType<ApiService>();

    TestBed.configureTestingModule({
      providers: [
        UserApiService,
        { provide: ApiService, useFactory: () => apiService.object }
      ]
    });
  });

  it("should be created", () => {
    const service: UserApiService = TestBed.get(UserApiService);
    expect(service).toBeTruthy();
  });
});
