import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IWallet } from "src/app/models/wallet.interface";
import { toDataURL } from "qrcode";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"]
})
export class WalletComponent implements OnInit {

  @Input()
  private wallet: IWallet;

  @Output()
  private moveDownEvent = new EventEmitter<number>();

  @Output()
  private moveUpEvent = new EventEmitter<number>();

  private qrData = "";

  constructor(private readonly route: ActivatedRoute) { }

  async ngOnInit() {
    try {
      this.qrData = await toDataURL(this.wallet.address, {
        margin: 0
      });
    } catch (error) {
      console.log("Caught an error: " + error);
    }
  }

  private onOwnProfile(): boolean {
    return "@" + localStorage.getItem("username") === this.route.snapshot.paramMap.get("username");
  }

  moveUp(index: number) {
    this.moveUpEvent.emit(index);
  }

  moveDown(index: number) {
    this.moveDownEvent.emit(index);
  }
}
