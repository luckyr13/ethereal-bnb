import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EtherealGameService } from '../../contracts/EtherealGame.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserSettingsService } from '../../auth/user-settings.service';
import { KopernikTokenService } from '../../contracts/KopernikToken.service';


@Component({
  selector: 'app-modal-search-fighter',
  templateUrl: './modal-search-fighter.component.html',
  styleUrls: ['./modal-search-fighter.component.scss']
})
export class ModalSearchFighterComponent implements OnInit {
	totalFighters: number = 0;
	fighters: any[] = [];
	isLoading: boolean = false;
  disableButtons: boolean = false;

  constructor(
  	@Inject(MAT_DIALOG_DATA) public data: {mainAccount: string, myCharacterId: string},
  	private etherealGame: EtherealGameService,
    private snackbar: MatSnackBar,
    private userSettings: UserSettingsService,
    private kopernikToken: KopernikTokenService
  ) { }

  async ngOnInit() {
    try {

      this.isLoading = true;
      await this.getTotalFighters();
      this.isLoading = false;

    } catch (err) {
      console.error(err);
      this.message('Error!!', 'error')
    }
  }


  async getTotalFighters() {
    try {
      this.etherealGame.init();
      this.totalFighters = await this.etherealGame.getNumPlayers();

      if (this.totalFighters > 0) {
        await this.getFighters(this.totalFighters);
      }
    } catch (err) {
      throw err;
    }
  }

  async getFighters(totalFighters: number) {

    try {
      this.etherealGame.init();
      this.fighters = await this.etherealGame.getAllFighters(totalFighters, this.data.mainAccount);
    } catch (err) {
      throw err;
    }
  }

  async requestFight(_opponent: string) {
    try {
      this.etherealGame.init();
      this.disableButtons = true;
      this.isLoading = true;
      await this.etherealGame.requestFight(_opponent, this.data.myCharacterId, this.data.mainAccount);

      this.etherealGame.setRequestFightListeners(this.data.mainAccount, _opponent, async () => {
        this.message('Request created successfully!!', 'success')
        this.disableButtons = false;
        this.isLoading = false;
        // Update koperniks balance
        await this.getKoperniksBalance(this.data.mainAccount);

      });

    } catch (err) {
      console.error(err);
      this.disableButtons = false;
      this.isLoading = false;
      this.message('Error request!!', 'error')
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

  message(msg: string, panelClass: string = '', verticalPosition: any = undefined) {
    this.snackbar.open(msg, 'X', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: verticalPosition,
      panelClass: panelClass
    });
  }



}
