import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ProfileComponent } from "./profile.component";
import { UserApiService } from "src/app/services/api/user-api.service";
import { ActivatedRoute, Params, ParamMap, convertToParamMap } from "@angular/router";
import { Mock, IMock, It, Times } from "typemoq";
import { of } from "rxjs";
import { IUser } from "./../../models/user.interface";

describe("ProfileComponent", () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let userApiService: IMock<UserApiService>;

  beforeEach(async(() => {
    const user: IUser = {
      email: "thisIsMyEmail",
      displayName: "thisIsMyName",
      username: "thisIsMyUsername",
      wallets: [
        {
          address: "thisIsAnAddress",
          currency: "thisIsACurrency",
          name: "thisIsAName"
        }
      ]
    } as IUser;

    userApiService = Mock.ofType<UserApiService>();
    userApiService
      .setup(u => u.getUser(It.isAny()))
      .returns(async () => user);

    TestBed.configureTestingModule({
      declarations: [
        ProfileComponent
      ],
      providers: [
        ProfileComponent,
        { provide: UserApiService, useFactory: () => userApiService.object },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({id: 1})) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
