import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EtherealGameService } from '../../contracts/EtherealGame.service';

@Component({
  selector: 'app-modal-search-fighter',
  templateUrl: './modal-search-fighter.component.html',
  styleUrls: ['./modal-search-fighter.component.scss']
})
export class ModalSearchFighterComponent implements OnInit {
	totalFighters: number = 0;
	fighters: any[] = [];
	isLoading: boolean = false;

  constructor(
  	@Inject(MAT_DIALOG_DATA) public data: {name: string},
  	private etherealGame: EtherealGameService
  ) { }

  async ngOnInit() {
  	this.isLoading = true;
  	await this.getTotalFighters();
  	this.isLoading = false;
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
      this.fighters = await this.etherealGame.getAllFighters(totalFighters);
    } catch (err) {
      throw err;
    }
  }

}
