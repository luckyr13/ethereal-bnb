import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { UserSettingsService } from '../../auth/user-settings.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KopernikTokenService } from '../../contracts/KopernikToken.service';
import { EtherealGameService } from '../../contracts/EtherealGame.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
 public loading: boolean = true;
  public isLoggedIn: boolean = true;
  public mainAccount: string = '';
  public totalFightRequests: number = 0;
  public fightRequests: any[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
    private userSettings: UserSettingsService,
    private etherealGame: EtherealGameService,
    private kopernikToken: KopernikTokenService
  ) { }



  message(msg: string, panelClass: string = '', verticalPosition: any = undefined) {
    this.snackbar.open(msg, 'X', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: verticalPosition,
      panelClass: panelClass
    });
  }


  async ngOnInit() {
    this.loading = true;

    this.userSettings.account$.subscribe(async (account) => {
      if (account && account != 'null') {
        this.isLoggedIn = true;
        this.mainAccount = account;
      }
    });

    window.setTimeout(async () =>{
      const wallet = this.userSettings.getWalletOptionOnLocalStorage();
      this.mainAccount = await this.auth.getMainAccount();
      if (wallet && wallet != 'null' && !this.mainAccount) {
        await this.connectWallet(wallet);
      } else if (wallet && this.mainAccount) {

        // Get my total characters 
        await this.getMyTotalCharacters(this.mainAccount);

      }
      this.loading = false;

    }, 1000);

  }

  async connectWallet(option: string) {
    try {
      // Connect wallet
      const res = await this.auth.connectWalletAndSetListeners(option, () => {
        this.router.navigate(['/wrong-network']);
        this.message(`Wrong network detected ...`, 'error');
      });
      // Get balance
      await this.getKoperniksBalance(res.account);
      // Get my total characters 
      await this.getMyTotalCharacters(this.mainAccount);
    } catch (err) {
      this.message(`${err}`, 'error');
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

  async getMyTotalCharacters(account: string) {
    try {
      this.etherealGame.init();
      this.totalFightRequests = await this.etherealGame.getTotalFightRequests(account);

      if (this.totalFightRequests > 0) {
        await this.getFightRequestsList(account, this.totalFightRequests);
      }
    } catch (err) {
      throw err;
    }
  }

  async getFightRequestsList(account: string, totalCharacters: number) {

    try {
      this.etherealGame.init();
      this.fightRequests = await this.etherealGame.getFightRequests(account);
    } catch (err) {
      throw err;
    }
  }

}
