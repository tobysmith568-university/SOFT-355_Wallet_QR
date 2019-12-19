import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { StorageService } from "src/app/services/storage.service";

@Component({
  selector: "app-logout",
  templateUrl: "./logout.component.html",
  styleUrls: ["./logout.component.scss"]
})
export class LogoutComponent implements OnInit {

  constructor(private readonly router: Router,
              private readonly storageService: StorageService) { }

  ngOnInit() {
    this.storageService.remove("token");
    this.router.navigate([""]);
  }
}
