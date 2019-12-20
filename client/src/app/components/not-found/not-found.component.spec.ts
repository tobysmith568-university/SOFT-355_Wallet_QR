import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NotFoundComponent } from "./not-found.component";
import { IMock, Mock } from "typemoq";
import { Router, NavigationExtras, RouterModule, Navigation } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

fdescribe("NotFoundComponent", () => {
  let router: IMock<Router>;

  let subject: NotFoundComponent;

  beforeEach(() => {
    router = Mock.ofType<Router>();

    subject = new NotFoundComponent(router.object);
  });

  describe("ngOnInit", async () => {
    it("should set path to 404 when state is falsy", () => {
      given_router_navigation_navigationExtras_state_returns(null);

      subject.ngOnInit();

      expect(subject.path).toBe("404");
    });

    it("should set path to the given username when state is truthy", () => {
      const username = "This is a username";
      const extras = {
        username
      };

      given_router_navigation_navigationExtras_state_returns(extras);

      subject.ngOnInit();

      expect(subject.path).toBe(username);
    });
  });

  function given_router_navigation_navigationExtras_state_returns(returns: any) {
    const navigation = Mock.ofType<Navigation>();
    const navigationExtras = Mock.ofType<NavigationExtras>();

    router
      .setup(r => r.getCurrentNavigation())
      .returns(() => navigation.object);

    navigation
      .setup(n => n.extras)
      .returns(() => navigationExtras.object);

    navigationExtras
      .setup(n => n.state)
      .returns(() => returns);
  }
});
