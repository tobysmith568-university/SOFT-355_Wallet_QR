import { Component, OnInit } from "@angular/core";
import { UserApiService } from "src/app/services/api/user-api.service";
import { IWallet } from "src/app/models/wallet.interface";
import { ActivatedRoute, Router } from "@angular/router";
import { IError } from "src/app/services/api/error.interface";
import { IUser } from "src/app/models/user.interface";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {

  private name = "";
  private wallets: IWallet[] = new Array();

  constructor(private readonly userService: UserApiService,
              private readonly route: ActivatedRoute,
              private readonly router: Router) { }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const username = params.get("username");

      if (username.length < 2 || username[0] !== "@") {
        this.router.navigate([""]);
        return;
      }

      const result = await this.userService.getUser(username.substring(1));

      if (this.isError(result)) {
        this.name = result.error;
        this.wallets = new Array();
        return;
      }

      this.name = result.name;
      this.wallets = result.wallets;
    });
  }

  private isError(pet: IUser | IError): pet is IError {
    return (pet as IError).error !== undefined;
  }
}