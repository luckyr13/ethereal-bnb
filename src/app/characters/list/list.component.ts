import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { UserSettingsService } from '../../auth/user-settings.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EtherealCharacterService } from '../../contracts/EtherealCharacter.service';
import { KopernikTokenService } from '../../contracts/KopernikToken.service';
import {ELEMENTSOFNATURE} from '../../contracts/ElementsOfNature';
import {PLANETS} from '../../contracts/PlanetsTMP';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  public loading: boolean = true;
  public isLoggedIn: boolean = true;
  public mainAccount: string = '';
  public totalCharacters: number = 0;
  public characters: any[] = [];
  public elementsOfNature = ELEMENTSOFNATURE;
  public planetsNames = PLANETS;
  public genderNames = ['MALE', 'FEMALE', 'UNDEFINED'];

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
    private userSettings: UserSettingsService,
    private etherealCharacter: EtherealCharacterService,
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
      this.etherealCharacter.init();
      this.totalCharacters = await this.etherealCharacter.getBalanceOf(account);

      if (this.totalCharacters > 0) {
        await this.getCharactersList(account, this.totalCharacters);
      }
    } catch (err) {
      throw err;
    }
  }

  async getCharactersList(account: string, totalCharacters: number) {

    try {
      this.etherealCharacter.init();
      this.characters = await this.etherealCharacter.getAllMyCharacters(account, totalCharacters);
    } catch (err) {
      throw err;
    }
  }



}
