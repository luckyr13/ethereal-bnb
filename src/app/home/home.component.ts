import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { SelectWalletDialogComponent } from '../select-wallet-dialog/select-wallet-dialog.component';
import { UserSettingsService } from '../auth/user-settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KopernikTokenService } from '../contracts/KopernikToken.service';
import { Router } from '@angular/router';
import { EtherealGameService } from '../contracts/EtherealGame.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

declare const window: any;

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	public loading: boolean = true;
  public isLoggedIn: boolean = false;
  public isRegistered: boolean = false;
  public registerForm = new FormGroup({
    nickname: new FormControl('', [ Validators.required]),
  });
  registerFormProcessing: boolean = false;
  mainAccount: string = '';
  etherealPlayerName: string = '';
  wins: number = 0;
  loss: number = 0;
  tie: number = 0;
  gaveup: number = 0;

  get nickname() {
    return this.registerForm.get('nickname');
  }

  constructor(
    private auth: AuthService,
    private _bottomSheet: MatBottomSheet,
    private userSettings: UserSettingsService,
    private snackbar: MatSnackBar,
    private kopernikToken: KopernikTokenService,
    private router: Router,
    private etherealGame: EtherealGameService
  ) { }


  async connectWallet(option: string) {
    try {
      // Connect wallet
      const res = await this.auth.connectWalletAndSetListeners(option, () => {
        this.router.navigate(['/wrong-network']);
        this.message(`Wrong network detected ...`, 'error');
      });
      // Save account 
      this.mainAccount = res.account;
      // Get balance
      await this.getKoperniksBalance(res.account);
      // Check if player is already registered
      await this.getIsPlayerRegistered(res.account);
      // If is registered 
      if (this.isRegistered) {
        const playerData = await this.etherealGame.getPlayerData(this.mainAccount);
        this.etherealPlayerName = this.etherealGame.hexToUtf8(playerData.nickname);
        this.wins = parseInt(playerData.wins);
        this.loss = parseInt(playerData.loss);
        this.tie = parseInt(playerData.tie);
        this.gaveup = parseInt(playerData.gaveup);
      }
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
      this.userSettings.setPlayerBalance(`${balance}`);
    } catch (err) {
      throw err;
    }
  }

  async getIsPlayerRegistered(account: string) {
    try {
      this.etherealGame.init();
      this.isRegistered = await this.etherealGame.getPlayerIsRegistered(account);
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


  ngOnInit() {
    this.loading = true;
    this.userSettings.account$.subscribe(async (account) => {
      if (account && account != 'null') {
        this.isLoggedIn = true;
        this.mainAccount = account;
        await this.getIsPlayerRegistered(account);
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

  async onSubmitRegister() {
     try {
      this.etherealGame.init();
      let nickname = this.nickname!.value ? this.nickname!.value : '';
      nickname = nickname.trim();
      this.registerFormProcessing = true;
      this.disableRegisterForm();
      // Check if nickname is available
      const isNicknameTaken = await this.etherealGame.getPlayerNicknameExists(nickname);
      if (isNicknameTaken) {
        throw Error('Nickname already taken. Please choose another one!');
      }
      // Register player
      const receipt = await this.etherealGame.registerPlayer(nickname, this.mainAccount);
      this.etherealGame.setRegisterPlayerListeners(this.mainAccount, (event: any) => {

        this.message(`Player succesfully registered!`, 'success');
        window.setTimeout(() => {
          window.location.reload();
        }, 1000);
      });

      
    } catch (err) { 
      this.message(`${err}`, 'error');
      console.error(err);
     
      this.registerFormProcessing = false;
      this.enablegisterForm();
    }

  }

  disableRegisterForm() {
    this.nickname!.disable();
  }

  enablegisterForm() {
    this.nickname!.enable();
  }

}
