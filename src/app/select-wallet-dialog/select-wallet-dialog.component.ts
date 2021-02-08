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
    try {
    	const res: any = await this.auth.connectWallet(option);
      const account = res.account;
      const networkId = res.networkId;
      const network = res.networkName;
      this.auth.setWalletChangeListeners();
      this.userSettings.saveUserSettings(account, networkId, network, option);
      this.message(`Welcome!`, 'success');
      this._bottomSheetRef.dismiss();
    } catch (err) {
      this.message(`${err}`, 'error');
    }
  }

 

  message(msg: string, panelClass: string = '') {
    this.snackbar.open(msg, 'X', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: panelClass
    });
  }

}
