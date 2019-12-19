import { Component, OnInit } from "@angular/core";
import { UserApiService } from "src/app/services/api/user-api.service";
import { IWallet } from "src/app/models/wallet.interface";
import { ActivatedRoute, Router } from "@angular/router";
import { IError } from "src/app/services/api/error.interface";
import { IUser } from "src/app/models/user.interface";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { connect } from "socket.io-client";
import { ISetWallets } from "src/app/models/websocket-models/set-wallets.interface";
import { StorageService } from "src/app/services/storage.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {

  private loaded = false;
  private name = "";
  private wallets: IWallet[] = new Array();
  private editWalletsWebsocket: SocketIOClient.Socket;

  constructor(private readonly userService: UserApiService,
              private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly storageService: StorageService) {
    this.editWalletsWebsocket = connect("ws://localhost:8000/editwallets");

    this.editWalletsWebsocket.on("connect", () => {
      this.editWalletsWebsocket.on("wallets", (data: string) => {
        const result: ISetWallets = JSON.parse(data);
        this.wallets = result.wallets;
      });
    });
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

      this.loaded = false;
      this.name = "";
      this.wallets = [];

      const usernameWithNoAt = username.substring(1);

      const result = await this.userService.getUser(usernameWithNoAt);

      if (this.isError(result)) {
        this.name = result.error;
        this.wallets = new Array();
        this.loaded = true;
        return;
      }

      this.editWalletsWebsocket.emit("profile", usernameWithNoAt);

      this.loaded = true;
      this.name = result.displayName;
      this.wallets = result.wallets;
    });
  }

  private isError(pet: IUser | IError): pet is IError {
    return (pet as IError).error !== undefined;
  }

  private deleteWallet(index: number) {
    this.wallets.splice(index, 1);
    this.sendUpdate();
  }

  private moveWalletUp(index: number) {
    moveItemInArray(this.wallets, index, index + 1);
    this.sendUpdate();
  }

  private moveWalletDown(index: number) {
    moveItemInArray(this.wallets, index, index - 1);
    this.sendUpdate();
  }

  private sendUpdate() {
    this.editWalletsWebsocket.emit("set", {
      token: this.storageService.get("token"),
      wallets: this.wallets
    } as ISetWallets);
  }
}
