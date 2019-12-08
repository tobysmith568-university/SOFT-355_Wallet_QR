import { Component, OnInit, Input } from "@angular/core";
import { IWallet } from "src/app/models/wallet.interface";
import { toDataURL } from "qrcode";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"]
})
export class WalletComponent implements OnInit {

  @Input()
  private wallet: IWallet;

  private qrData = "";

  constructor() { }

  async ngOnInit() {
    try {
      this.qrData = await toDataURL(this.wallet.address, {
        margin: 0
      });
    } catch (error) {
      console.log("Caught an error: " + error);
    }
  }
}
