import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { isNullOrUndefined } from "util";
import { connect } from "socket.io-client";
import { ISetWallets } from "src/app/models/websocket-models/set-wallets.interface";
import { UserApiService } from "src/app/services/api/user-api.service";
import { IUser } from "src/app/models/user.interface";
import { IError } from "src/app/services/api/error.interface";
import { StorageService } from "src/app/services/storage.service";

@Component({
  selector: "app-new-wallet",
  templateUrl: "./new-wallet.component.html",
  styleUrls: ["./new-wallet.component.scss"]
})
export class NewWalletComponent implements OnInit {

  private formEnabled = false;
  private emailUnverified = false;

  private currency: string;
  private name: string;
  private address: string;

  private another: boolean;
  private created: boolean;

  private currencyError = "";
  private addressError = "";

  private editWalletsWebsocket: SocketIOClient.Socket;

  constructor(private readonly router: Router,
              private readonly userApiService: UserApiService,
              private readonly storageService: StorageService) {
    this.editWalletsWebsocket = connect("ws://localhost:8000/editwallets");
  }

  async ngOnInit() {
    if (!this.isLoggedIn()) {
      this.router.navigate(["/"]);
    }

    const user = await this.userApiService.getUser(this.storageService.get("username"));

    if (this.isError(user)) {
      return;
    }

    if (user.emailVerified) {
      this.formEnabled = true;
      this.emailUnverified = false;
    } else {
      this.emailUnverified = true;
    }
  }

  private isLoggedIn() {
    const token = this.storageService.get("token");
    return token !== null && token.length > 0;
  }

  private currencyFocusOut() {
    if (isNullOrUndefined(this.currency) || this.currency.length === 0) {
      this.currencyError = "You need to enter a currency";
      return;
    }

    this.currencyError = "";
  }

  private addressFocusOut() {
    if (isNullOrUndefined(this.address) || this.address.length === 0) {
      this.addressError = "You need to enter an address";
      return;
    }

    this.addressError = "";
  }

  private create() {
    this.currencyFocusOut();
    this.addressFocusOut();

    if (this.currencyError
     || this.addressError) {
      return;
    }

    this.formEnabled = false;

    this.editWalletsWebsocket.emit("add", {
      token: this.storageService.get("token"),
      wallets: [
        {
          name: this.name,
          address: this.address,
          currency: this.currency
        }
      ]
    } as ISetWallets);

    if (this.another) {
      location.reload();
      return;
    }

    this.router.navigate(["@" + this.storageService.get("username")]);
  }

  private isError(result: IUser | IError): result is IError {
    return (result as IError).error !== undefined;
  }
}
