import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { isNullOrUndefined } from "util";
import { connect } from "socket.io-client";
import { ISetWallets } from "src/app/models/websocket-models/set-wallets.interface";

@Component({
  selector: "app-new-wallet",
  templateUrl: "./new-wallet.component.html",
  styleUrls: ["./new-wallet.component.scss"]
})
export class NewWalletComponent implements OnInit {

  private formEnabled = true;

  private currency: string;
  private name: string;
  private address: string;

  private another: boolean;
  private created: boolean;

  private currencyError = "";
  private addressError = "";

  private editWalletsWebsocket: SocketIOClient.Socket;

  constructor(private readonly router: Router) {
    this.editWalletsWebsocket = connect("ws://localhost:8000/editwallets");
  }

  ngOnInit() {
    if (!this.isLoggedIn()) {
      this.router.navigate(["/"]);
    }
  }

  private isLoggedIn() {
    const token = localStorage.getItem("token");
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
      token: localStorage.getItem("token"),
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

    this.router.navigate(["@" + localStorage.getItem("username")]);
  }
}
