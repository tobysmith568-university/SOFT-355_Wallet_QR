import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-not-found",
  templateUrl: "./not-found.component.html",
  styleUrls: ["./not-found.component.scss"]
})
export class NotFoundComponent implements OnInit {

  path: string;
  message: string;

  constructor(private readonly router: Router) {
    const state = this.router.getCurrentNavigation().extras.state;

    this.path = state ? state.username : "404";
  }

  ngOnInit() {
  }

}
