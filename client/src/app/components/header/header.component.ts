import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { connect } from "socket.io-client";
import { ISearchResult } from "src/app/models/websocket-models/search-result.interface";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {

  private currentRoute: string;
  private searchTerm = "";
  private searchResults: ISearchResult[] = [ ];
  private userSearchWebsocket: SocketIOClient.Socket;

  constructor(private readonly router: Router) {
    this.userSearchWebsocket = connect("ws://localhost:8000/searchusers");

    this.userSearchWebsocket.on("connect", () => {
      this.userSearchWebsocket.on("results", (data: ISearchResult[]) => {
        this.searchResults = data;
      });
    });
  }

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
      this.userSearchWebsocket.emit("search", this.searchTerm);
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
