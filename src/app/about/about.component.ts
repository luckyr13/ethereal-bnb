import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserSettingsService } from '../auth/user-settings.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KopernikTokenService } from '../contracts/KopernikToken.service';
import { EtherealGameService } from '../contracts/EtherealGame.service';
import { EtherealCharacterService } from '../contracts/EtherealCharacter.service';

@Component({
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
	public loading: boolean = true;
  public isLoggedIn: boolean = true;
  public mainAccount: string = '';
  public totalPlayers: number = 0;
  public etherealGameContractAddress: string = '';
  public kopernikContractAddress: string = '';
  public etherealCharacterContractAddress: string = '';
  public etherealKopernikBalance: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
    private kopernikToken: KopernikTokenService,
    private userSettings: UserSettingsService,
    private etherealGame: EtherealGameService,
    private etherealCharacter: EtherealCharacterService
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
    this.etherealGameContractAddress = this.etherealGame.getContractAddress();
    this.kopernikContractAddress = this.kopernikToken.getContractAddress();
    this.etherealCharacterContractAddress = this.etherealCharacter.getContractAddress();

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
        // Get total players 
        await this.geTotalPlayers();
        // Get Ethereal's balance 
        await this.getEtherealKopkerniksBalance();
      } else if (wallet && this.mainAccount) {
        // Get total players 
        await this.geTotalPlayers();
        // Get Ethereal's balance 
        await this.getEtherealKopkerniksBalance();

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

  async getEtherealKopkerniksBalance() {
    try {
      this.kopernikToken.init();
      this.etherealKopernikBalance = await this.kopernikToken.getBalance(
        this.etherealGameContractAddress
      );
      const tmpBalance = parseInt(this.etherealKopernikBalance);
      const decimals = tmpBalance % 100;
      const number = tmpBalance / 100;

      this.etherealKopernikBalance = `${number}.${decimals}`;
    } catch (err) {
      throw err;
    }
    
  }

  async geTotalPlayers() {
    try {
      this.etherealGame.init();
      this.totalPlayers = await this.etherealGame.getNumPlayers();
    } catch (err) {
      throw err;
    }
  }

}
