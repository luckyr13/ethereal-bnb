import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { AuthService } from '../auth/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { UserSettingsService } from '../auth/user-settings.service';
import { Router } from '@angular/router';
import { KopernikTokenService } from '../contracts/KopernikToken.service';

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
    private userSettings: UserSettingsService,
    private router: Router,
    private kopernikToken: KopernikTokenService,
  ) {}

  async connectWallet(option: string) {
    try {
      // Connect wallet
      const res = await this.auth.connectWalletAndSetListeners(option, () => {
        this.router.navigate(['/wrong-network']);
        this.message(`Wrong network detected ...`, 'error');
        this._bottomSheetRef.dismiss();
      });
      // Get balance
      await this.getKoperniksBalance(res.account);
      this.message(`Welcome!`, 'success');
      this._bottomSheetRef.dismiss();
    } catch (err) {
      this.message(`${err}`, 'error', 'top');
    }
  }

  async getKoperniksBalance(account: string) {
    let balance = 0;
    try {
      this.kopernikToken.init();
      balance = await this.kopernikToken.getBalance(account);
      this.userSettings.setPlayerBalance(`${balance}`);
    } catch (err) {
      throw err;
    }
  }


  message(msg: string, panelClass: string = '', verticalPosition: any = undefined) {
    this.snackbar.open(msg, 'X', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: verticalPosition,
      panelClass: panelClass
    });
  }

}
