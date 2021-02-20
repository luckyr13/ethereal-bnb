import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EtherealGameService } from '../../contracts/EtherealGame.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserSettingsService } from '../../auth/user-settings.service';
import { KopernikTokenService } from '../../contracts/KopernikToken.service';
import { EtherealCharacterService } from '../../contracts/EtherealCharacter.service';
import {ELEMENTSOFNATURE} from '../../contracts/ElementsOfNature';
import {PLANETS} from '../../contracts/PlanetsTMP';
declare const window: any;

@Component({
  selector: 'app-modal-accept-fight',
  templateUrl: './modal-accept-fight.component.html',
  styleUrls: ['./modal-accept-fight.component.scss']
})
export class ModalAcceptFightComponent implements OnInit {
	totalCharacters: number = 0;
	characters: any[] = [];
	isLoading: boolean = false;
  disableButtons: boolean = false;
  public elementsOfNature = ELEMENTSOFNATURE;
  public planetsNames = PLANETS;
  public genderNames = ['MALE', 'FEMALE', 'UNDEFINED'];

  constructor(
  	@Inject(MAT_DIALOG_DATA) public data: {mainAccount: string, fightRequestId: string},
  	private etherealCharacter: EtherealCharacterService,
    private snackbar: MatSnackBar,
    private userSettings: UserSettingsService,
    private kopernikToken: KopernikTokenService,
  	private etherealGame: EtherealGameService
  ) { }

  async ngOnInit() {
  	this.isLoading = true;
  	// Get my total characters 
    await this.getMyTotalCharacters(this.data.mainAccount);

  	this.isLoading = false;
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


  async acceptFight(_myCharacterId: string) {
    try {
      this.etherealGame.init();
      this.disableButtons = true;
      this.isLoading = true;
      await this.etherealGame.acceptFight(this.data.fightRequestId, _myCharacterId, this.data.mainAccount);

      this.message('Request successful!!', 'success')
      window.location.reload();


    } catch (err) {
      console.error(err);
      this.disableButtons = false;
      this.isLoading = false;
      this.message('Error request!!', 'error')
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

}
