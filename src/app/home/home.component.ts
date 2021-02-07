import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { SelectWalletDialogComponent } from '../select-wallet-dialog/select-wallet-dialog.component';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	public loading: boolean = true;
  public account: string = '';

  constructor(
    private auth: AuthService,
    private _bottomSheet: MatBottomSheet
  ) { }

  ngOnInit(): void {
  	this.loading = false;
  }

  start(): void {
  	this.openBottomSheet();
  }

  openBottomSheet(): void {
    this._bottomSheet.open(SelectWalletDialogComponent);
  }

}
