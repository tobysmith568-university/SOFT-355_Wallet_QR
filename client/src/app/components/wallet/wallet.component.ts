import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IWallet } from "src/app/models/wallet.interface";
import { toDataURL } from "qrcode";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"]
})
export class WalletComponent implements OnInit {

  @Input()
  private wallet: IWallet;

  @Input()
  private index: number;

  @Output()
  private moveDownEvent = new EventEmitter<number>();

  @Output()
  private moveUpEvent = new EventEmitter<number>();

  @Output()
  private deleteEvent = new EventEmitter<number>();

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

  private moveUp() {
    this.moveUpEvent.emit(this.index);
  }

  private moveDown() {
    this.moveDownEvent.emit(this.index);
  }

  private delete() {
    this.deleteEvent.emit(this.index);
  }
}
