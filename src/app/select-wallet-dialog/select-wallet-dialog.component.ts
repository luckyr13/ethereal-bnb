import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-select-wallet-dialog',
  templateUrl: './select-wallet-dialog.component.html',
  styleUrls: ['./select-wallet-dialog.component.scss']
})
export class SelectWalletDialogComponent implements OnInit {
  ngOnInit(): void {
  }

  constructor(
  	private _bottomSheetRef: MatBottomSheetRef<SelectWalletDialogComponent>,
  	private auth: AuthService
  ) {}

  async connectWallet(option: number) {
    // this._bottomSheetRef.dismiss();
    try {
    	await this.auth.connect(option);
    } catch (err) {
    	console.log(`Error: ${err}`);
    }
  }

}
