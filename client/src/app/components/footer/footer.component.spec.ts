import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FooterComponent } from "./footer.component";

describe("FooterComponent", () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should contain a copyright notice", () => {
    const p = element.querySelector("p");
    expect(p.textContent).toEqual("© Copyright Toby Smith 2019. All rights reserved.");
  });
});
