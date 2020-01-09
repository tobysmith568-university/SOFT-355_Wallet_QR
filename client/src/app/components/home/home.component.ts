import { Component, OnInit } from "@angular/core";
import { StorageService } from "src/app/services/storage.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {

  signedIn: boolean;

  constructor(private readonly storageService: StorageService) { }

  ngOnInit() {
    const username = this.storageService.get("username");
    this.signedIn = username !== null && username !== undefined && username.length > 0;
  }
}
