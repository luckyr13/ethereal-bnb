import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {MatDialog} from '@angular/material/dialog';
import { SelectWalletDialogComponent } from '../select-wallet-dialog/select-wallet-dialog.component';


@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	public loading: boolean = true;

  constructor(
    private auth: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  	this.loading = false;
  }

  start(): void {
  	this.openSelectWalletModal();
  }

  openSelectWalletModal(): void {
    this.dialog.open(SelectWalletDialogComponent);
  }

}
