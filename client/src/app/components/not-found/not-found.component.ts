import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-not-found",
  templateUrl: "./not-found.component.html",
  styleUrls: ["./not-found.component.scss"]
})
export class NotFoundComponent implements OnInit {

  path: string;

  constructor(private readonly router: Router) {
  }

  ngOnInit() {
    const state = this.router.getCurrentNavigation().extras.state;
    this.path = state ? state.username : "404";
  }
}
