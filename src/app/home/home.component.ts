import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { SelectWalletDialogComponent } from '../select-wallet-dialog/select-wallet-dialog.component';
import { UserSettingsService } from '../auth/user-settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
declare const window: any;

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	public loading: boolean = true;
  public isLoggedIn: boolean = false;

  constructor(
    private auth: AuthService,
    private _bottomSheet: MatBottomSheet,
    private userSettings: UserSettingsService,
    private snackbar: MatSnackBar
  ) { }


  async connectWallet(option: string) {
    try {
      const res: any = await this.auth.connectWallet(option);
      const account = res.account;
      const networkId = res.networkId;
      const network = res.networkName;
      this.auth.setWalletChangeListeners();
      this.isLoggedIn = true;
      this.userSettings.saveUserSettings(account, networkId, network, option);
      // this.message(`Welcome back!`, 'success');
    } catch (err) {
      this.message(`${err}`, 'error');
    }
  }

 

  message(msg: string, panelClass: string = '') {
    this.snackbar.open(msg, 'X', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: panelClass
    });
  }



  ngOnInit() {
    this.loading = true;
    window.setTimeout(async () =>{
      const wallet = this.userSettings.getWalletOptionOnLocalStorage();
      if (wallet && wallet != 'null') {
        await this.connectWallet(wallet);
      }
      this.loading = false;
    }, 1000);

  }

  start(): void {
  	this.openBottomSheet();
  }

  openBottomSheet(): void {
    this._bottomSheet.open(SelectWalletDialogComponent);
  }

}
