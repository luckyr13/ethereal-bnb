import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { SelectWalletDialogComponent } from '../select-wallet-dialog/select-wallet-dialog.component';
import { UserSettingsService } from '../auth/user-settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KopernikTokenService } from '../contracts/KopernikToken.service';

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
    private snackbar: MatSnackBar,
    private kopernikToken: KopernikTokenService
  ) { }


  async connectWallet(option: string) {
    try {
      const account = await this.auth.connectWalletAndSetListeners(option);
      await this.getKoperniksBalance(account);
      this.message(`Welcome!`, 'success');
    } catch (err) {
      this.message(`${err}`, 'error');
    }
  }

  async getKoperniksBalance(account: string) {
    let balance = 0;
    try {
      this.kopernikToken.init();
      balance = await this.kopernikToken.getBalance(account);
    } catch (err) {
      throw err;
    }
    console.log('balance', balance);
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
    this.userSettings.account$.subscribe((account) => {
      if (account && account != 'null') {
        this.isLoggedIn = true;
      }
    });

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

  logout(): void {
    this.userSettings.deleteUserSettings();
    window.location.reload();
  }

}
