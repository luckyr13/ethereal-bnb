import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { UserSettingsService } from '../../auth/user-settings.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EtherealCharacterService } from '../../contracts/EtherealCharacter.service';
import { KopernikTokenService } from '../../contracts/KopernikToken.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {ICharacterBaseMetadata} from '../../contracts/ICharacterBaseMetadata';
import {ICharacterPhysicalMetadata} from '../../contracts/ICharacterPhysicalMetadata';
import {ICharacterAttributesMetadata} from '../../contracts/ICharacterAttributesMetadata';

@Component({
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {
public loading: boolean = true;
  public isLoggedIn: boolean = true;
  public mainAccount: string = '';

  public createCharacterForm = new FormGroup({
    name: new FormControl('', [ Validators.required]),
  });
  createCharacterFormProcessing: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
    private userSettings: UserSettingsService,
    private etherealCharacter: EtherealCharacterService,
    private kopernikToken: KopernikTokenService
  ) { }

  get name() {
    return this.createCharacterForm.get('name');
  }



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
        await this.getMyCharacters(this.mainAccount);

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
      await this.getMyCharacters(this.mainAccount);
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

  async getMyCharacters(account: string) {
    try {
      this.etherealCharacter.init();
    } catch (err) {
      throw err;
    }
  }

  async onSubmitRegister() {
     try {
      this.etherealCharacter.init();
      let name = this.name!.value ? this.name!.value : '';
      name = name.trim();
      this.createCharacterFormProcessing = true;
      this.disableCreateCharacterForm();
      // Check if name is available
      const isNameTaken = await this.etherealCharacter.getCharacterNameExists(name);
      if (isNameTaken) {
        throw Error('Character\'s name already taken. Please choose another one!');
      }
      // Set data 
      const base: ICharacterBaseMetadata = {
        name: name,
        birthdate: '',
        description: '',
        planetId: 1,
        genre: 0
      };
      const physical: ICharacterPhysicalMetadata = {
        skintone: 0,
        haircolor: 0,
        eyescolor: 0,
        weight: 0,
        height: 0,
        bodyType: 0
      };
      const attributes: ICharacterAttributesMetadata = {
        primaryElement: 0,
        secondaryElement: 0,
        life: 0,
        armor: 0,
        strength: 0,
        speed: 0,
        luck: 0,
        spirit: 0,
        level: 0,
        extraSkillsPoints: 0
      }

      // Register player
      const receipt = await this.etherealCharacter.mintCharacter(
        this.mainAccount, base, physical, attributes
      );
      this.etherealCharacter.setMintedCharacterListeners(this.mainAccount, (event: any) => {

        this.message(`Character registered succesfully!`, 'success');
        window.setTimeout(() => {
          this.router.navigate(['/characters']);
        }, 1000);
      });

      
    } catch (err) { 
      this.message(`${err}`, 'error');
      console.error(err);
     
      this.createCharacterFormProcessing = false;
      this.enableCreateCharacterForm();
    }

  }

  disableCreateCharacterForm() {
    this.name!.disable();
  }

  enableCreateCharacterForm() {
    this.name!.enable();
  }

}
