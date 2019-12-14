import { Component, OnInit } from "@angular/core";
import { UserApiService } from "src/app/services/api/user-api.service";
import { IWallet } from "src/app/models/wallet.interface";
import { ActivatedRoute, Router } from "@angular/router";
import { IError } from "src/app/services/api/error.interface";
import { IUser } from "src/app/models/user.interface";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

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
              private readonly router: Router) {
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const username = params.get("username");

      if (username.length < 2 || username[0] !== "@") {
        this.router.navigate(["/404"], {
          skipLocationChange: true,
          state: {
            username
          }
        });
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

  private deleteWallet(index: number) {
    this.wallets.splice(index, 1);
  }
}
