import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { AuthService } from '../auth/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { UserSettingsService } from '../auth/user-settings.service';

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
    private snackbar: MatSnackBar,
    private userSettings: UserSettingsService
  ) {}

  async connectWallet(option: string) {
    // this._bottomSheetRef.dismiss();
    try {
    	const res: any = await this.auth.connectWallet(option);
      const account = res.account;
      const networkId = res.networkId;
      this.saveUserSettings(account, networkId, option);
      this.message(`Network: ${networkId} Account: ${account}`);
    } catch (err) {
      this.message(`${err}`);
    }
  }

  saveUserSettings(account: string, networkId: string, wallet: string) {
    this.userSettings.setAccount(account);
    this.userSettings.setNetworkId(networkId);
    this.userSettings.wallet = wallet;
  }

  message(msg: string) {
    this.snackbar.open(msg, 'X', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

}
