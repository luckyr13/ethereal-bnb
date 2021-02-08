import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { UserSettingsService } from '../auth/user-settings.service';

@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.scss']
})
export class MainToolbarComponent implements OnInit {
	rotate: boolean = false;
  @Input() drawer: any;
  account: string = 'Not detected';
  network: string = 'Not connected';
  walletImg: string = '';

  constructor(
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private userSettings: UserSettingsService
  ) {}

  toggle() {
  	this.drawer.toggle();
  	this.rotate = !this.rotate;
  }

  ngOnInit() {
    this.userSettings.account$.subscribe((account) => {
      this.account = account;
    });
    this.userSettings.network$.subscribe((network) => {
      this.network = network;
    });
    this.userSettings.wallet$.subscribe((wallet) => {
      const walletOption = this.userSettings.getWalletOptionOnLocalStorage();
      switch (walletOption) {
        case 'binance':
          this.walletImg = 'assets/img/binance.png';
        break;
        case 'metamask':
          this.walletImg = 'assets/img/metamask.png';
        break;
        default:

        break;
      }
    });
    
    
  }


  message(msg: string) {
    this.snackbar.open(msg, 'X', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

}
