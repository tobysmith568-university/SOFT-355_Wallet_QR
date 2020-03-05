import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { StorageService } from "src/app/services/storage.service";
import { ISearchResult } from "src/app/models/search-result.interface";
import { UserApiService } from "src/app/services/api/user-api.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {

  currentRoute: string;
  searchTerm = "";
  searchResults: ISearchResult[] = [];
  focusedResult = -1;

  username: string;

  constructor(private readonly router: Router,
              private readonly storageService: StorageService,
              private readonly userAPIService: UserApiService) { }

  async ngOnInit() {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
      this.username = this.storageService.get("username");
    });

    this.username = this.storageService.get("username");
  }

  isCurrent(route: string): boolean {
    return this.currentRoute === route;
  }

  isLoggedIn() {
    const token = this.storageService.get("token");
    return token !== null && token.length > 0;
  }

  async search() {
    if (this.searchTerm.length > 0) {
      this.searchResults = await this.userAPIService.search(this.searchTerm);
    } else {
      this.searchResults = [];
    }

    console.log(this.searchResults);
  }

  searchBlur() {
    setTimeout(() => {
      this.searchResults = [];
    }, 100);
  }

  keypress(event: KeyboardEvent) {
    if (event.code === "ArrowDown" && this.focusedResult < this.searchResults.length - 1) {
      this.focusedResult++;
      return;
    }

    if (event.code === "ArrowUp" && this.focusedResult > 0) {
      this.focusedResult--;
    }
  }

  goToProfile(username: string) {

    if (username === undefined) {
      const result = this.searchResults[this.focusedResult];

      if (result !== undefined) {
        username = result.username;
      } else {
        username = this.searchTerm;
      }
    }

    if (username.length > 0) {
      this.router.navigate(["@" + username]);
      this.searchTerm = "";
      this.searchResults = [];
    }

    this.focusedResult = -1;
  }
}
