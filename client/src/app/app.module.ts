import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { PERFECT_SCROLLBAR_CONFIG } from "ngx-perfect-scrollbar";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./components/home/home.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { RouterModule, Routes } from "@angular/router";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { WalletComponent } from "./components/wallet/wallet.component";
import { LoginComponent } from "./components/login/login.component";
import { FormsModule } from "@angular/forms";
import { LogoutComponent } from "./components/logout/logout.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { SignupComponent } from "./components/signup/signup.component";
import { MatIconRegistry, MatIconModule } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { DragDropModule } from "@angular/cdk/drag-drop";

const scrollConfig: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

const routes: Routes = [
  { path: "", pathMatch: "full", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "logout", component: LogoutComponent },
  { path: "signup", component: SignupComponent },
  { path: "404", component: NotFoundComponent },
  { path: ":username", component: ProfileComponent },
  { path: "**", redirectTo: "/404" }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
    HeaderComponent,
    FooterComponent,
    WalletComponent,
    LoginComponent,
    LogoutComponent,
    NotFoundComponent,
    SignupComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    PerfectScrollbarModule,
    MatIconModule,
    DragDropModule
  ],
  exports: [
    RouterModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: scrollConfig
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl("./assets/mdi.svg"));
  }
}
