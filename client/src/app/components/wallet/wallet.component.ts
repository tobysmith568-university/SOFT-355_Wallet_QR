import { Component, OnInit, Input } from "@angular/core";
import { IWallet } from "src/app/models/wallet.interface";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"]
})
export class WalletComponent implements OnInit {

  @Input()
  private wallet: IWallet;

  constructor() { }

  ngOnInit() {
  }

}
