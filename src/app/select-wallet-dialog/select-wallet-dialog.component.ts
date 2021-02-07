import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { AuthService } from '../auth/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';

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
  	private auth: AuthService,
    private snackbar: MatSnackBar
  ) {}

  async connectWallet(option: string) {
    // this._bottomSheetRef.dismiss();
    try {
    	await this.auth.connectWallet(option);
    } catch (err) {
      this.message(`${err}`);
    }
  }

  message(msg: string) {
    this.snackbar.open(msg, 'X', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

}
