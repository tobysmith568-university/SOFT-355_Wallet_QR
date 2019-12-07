import { Component, OnInit } from "@angular/core";
import { UserApiService } from "src/app/services/api/user-api.service";
import { IWallet } from "src/app/models/wallet.interface";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {

  private name = "";
  private wallets: IWallet[] = new Array<IWallet>();

  constructor(private readonly userService: UserApiService,
              private readonly route: ActivatedRoute) { }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const user = await this.userService.getUser(params.get("username"));
      this.name = user.name;
      this.wallets = user.wallets;
    });
  }
}
