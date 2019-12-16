import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {

  private currentRoute: string;
  private searchTerm = "";
  private searchResults = [ ];

  constructor(private readonly router: Router) { }

  async ngOnInit() {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  private isCurrent(route: string): boolean {
    return this.currentRoute === route;
  }

  private isLoggedIn() {
    const token = localStorage.getItem("token");
    return token !== null && token.length > 0;
  }

  private search() {
    if (this.searchTerm.length > 0) {
      this.searchResults = [ this.searchTerm ];
    } else {
      this.searchResults = [];
    }
  }

  private goToProfile(username: string) {
    if (username.length > 0) {
      this.router.navigate(["@" + username]);
      this.searchTerm = "";
      this.searchResults = [];
    }
  }
}
