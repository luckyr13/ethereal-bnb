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
import { IEtherealPlanet } from '../../contracts/IEtherealPlanet';
import { EtherealPlanetService } from '../../contracts/EtherealPlanet.service';
import {ELEMENTSOFNATURE} from '../../contracts/ElementsOfNature';

@Component({
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {
  public loading: boolean = true;
  public isLoggedIn: boolean = true;
  public mainAccount: string = '';
  public planets: any[] = [];
  public elementsOfNature = ELEMENTSOFNATURE;

  public createCharacterForm = new FormGroup({
    name: new FormControl('', [ Validators.required]),
    description: new FormControl('', [ Validators.required]),
    birthdate: new FormControl('', [ Validators.required]),
    planetid: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    primaryelement: new FormControl('', [Validators.required]),
    secondaryelement: new FormControl('', [Validators.required]),
    life: new FormControl('1', [Validators.required]),
    armor: new FormControl('1', [Validators.required]),
    strength: new FormControl('1', [Validators.required]),
    speed: new FormControl('1', [Validators.required]),
    luck: new FormControl('1', [Validators.required]),
    spirit: new FormControl('1', [Validators.required])
  });
  createCharacterFormProcessing: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
    private userSettings: UserSettingsService,
    private etherealCharacter: EtherealCharacterService,
    private kopernikToken: KopernikTokenService,
    private etherealPlanet: EtherealPlanetService
  ) { }

  get name() {
    return this.createCharacterForm.get('name');
  }

  get description() {
    return this.createCharacterForm.get('description');
  }

  get birthdate() {
    return this.createCharacterForm.get('birthdate');
  }

  get planetId() {
    return this.createCharacterForm.get('planetid');
  }

  get gender() {
    return this.createCharacterForm.get('gender');
  }

  get primaryelement() {
    return this.createCharacterForm.get('primaryelement');
  }

  get secondaryelement() {
    return this.createCharacterForm.get('secondaryelement');
  }
  get life() {
    return this.createCharacterForm.get('life');
  }
  get armor() {
    return this.createCharacterForm.get('armor');
  }
  get strength() {
    return this.createCharacterForm.get('strength');
  }
  get speed() {
    return this.createCharacterForm.get('speed');
  }
  get luck() {
    return this.createCharacterForm.get('luck');
  }
  get spirit() {
    return this.createCharacterForm.get('spirit');
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

        // Get planets list
        await this.getPlanets(this.mainAccount);

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
      // Get planets list
      await this.getPlanets(this.mainAccount);
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

  async getPlanets(account: string) {
    try {
      this.etherealPlanet.init();
      this.planets = await this.etherealPlanet.getPlanets();
    } catch (err) {
      throw err;
    }
  }

  async onSubmitRegister() {
     try {
      this.etherealCharacter.init();
      let name = this.name!.value ? this.name!.value : '';
      let description = this.description!.value ? this.description!.value : '';
      let birthdate = this.birthdate!.value ? this.birthdate!.value : '';
      let planetId = this.planetId!.value ? this.planetId!.value : '';
      let gender = this.gender!.value ? this.gender!.value : 0;
      let primaryElement = this.primaryelement!.value ? this.primaryelement!.value : 0;
      let secondaryElement = this.secondaryelement!.value ? this.secondaryelement!.value : 0;
      let life = this.life!.value ? this.life!.value : 0;
      let armor = this.armor!.value ? this.armor!.value : 0;
      let strength = this.strength!.value ? this.strength!.value : 0;
      let speed = this.speed!.value ? this.speed!.value : 0;
      let luck = this.luck!.value ? this.luck!.value : 0;
      let spirit = this.spirit!.value ? this.spirit!.value : 0;

      name = name.trim();
      description = description.trim();
      birthdate = birthdate.getDate()  + "-" + (birthdate.getMonth()+1) + "-" + birthdate.getFullYear();


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
        birthdate: birthdate,
        description: description,
        planetId: planetId,
        genre: gender
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
        primaryElement: primaryElement,
        secondaryElement: secondaryElement,
        life: life,
        armor: armor,
        strength: strength,
        speed: speed,
        luck: luck,
        spirit: spirit,
        level: 0,
        extraSkillsPoints: 0
      }

      if (!this.isValidTotalPointsCombination(attributes, 10)) {
        throw 'Exactly 10 points are allowed to use in your attributes';
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
     
      this.createCharacterFormProcessing = false;
      this.enableCreateCharacterForm();
    }

  }

  disableCreateCharacterForm() {
    this.name!.disable();
    this.description!.disable();
    this.birthdate!.disable();
    this.planetId!.disable();
    this.gender!.disable();
    this.primaryelement!.disable();
    this.secondaryelement!.disable();
    this.life!.disable();
  }

  enableCreateCharacterForm() {
    this.name!.enable();
    this.description!.enable();
    this.birthdate!.enable();
    this.planetId!.enable();
    this.primaryelement!.enable();
    this.secondaryelement!.enable();
    this.life!.enable();
  }

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'pts';
    }
    return value;
  }

  getTotalPointsUsed() {
    let life = this.life!.value ? this.life!.value : 0;
    let armor = this.armor!.value ? this.armor!.value : 0;
    let strength = this.strength!.value ? this.strength!.value : 0;
    let speed = this.speed!.value ? this.speed!.value : 0;
    let luck = this.luck!.value ? this.luck!.value : 0;
    let spirit = this.spirit!.value ? this.spirit!.value : 0;

    let total = (parseInt(life) 
                + parseInt(armor)
                + parseInt(strength)
                + parseInt(speed)
                + parseInt(luck)
                + parseInt(spirit));

    return total;
  }

  isValidTotalPointsCombination(attributes: ICharacterAttributesMetadata, maxpoints: number): boolean {
    const totalPoints = this.getTotalPointsUsed();
    if (totalPoints == maxpoints) {
      return true;
    }
    return false;
  }
}
