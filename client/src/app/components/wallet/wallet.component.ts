import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IWallet } from "src/app/models/wallet.interface";
import { toDataURL } from "qrcode";
import { ActivatedRoute } from "@angular/router";
import { StorageService } from "src/app/services/storage.service";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"]
})
export class WalletComponent implements OnInit {

  @Input()
  wallet: IWallet;

  @Input()
  index: number;

  @Output()
  moveDownEvent = new EventEmitter<number>();

  @Output()
  moveUpEvent = new EventEmitter<number>();

  @Output()
  deleteEvent = new EventEmitter<number>();

  qrData = "";

  constructor(private readonly route: ActivatedRoute,
              private readonly storageService: StorageService) { }

  async ngOnInit() {
    try {
      this.qrData = await toDataURL(this.wallet.address, {
        margin: 0
      });
    } catch (error) {
      console.log("Caught an error: " + error);
    }
  }

  onOwnProfile(): boolean {
    return "@" + this.storageService.get("username") === this.route.snapshot.paramMap.get("username");
  }

  moveUp() {
    this.moveUpEvent.emit(this.index);
  }

  moveDown() {
    this.moveDownEvent.emit(this.index);
  }

  delete() {
    this.deleteEvent.emit(this.index);
  }
}
