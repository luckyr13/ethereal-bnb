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
  playerBalance: string = '0';
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
      if (account != '') {
        this.account = account;
      } else {
        this.account = 'Not detected';
      }
    });
    this.userSettings.network$.subscribe((network) => {
      if (network != '') {
        this.network = network;
      } else {
        this.network = 'Not connected';
      }
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

    this.userSettings.playerBalance$.subscribe((playerBalance) => {
      if (playerBalance != '') {
        this.playerBalance = playerBalance;
      } else {
        this.playerBalance = '0';
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
