import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-select-wallet-dialog',
  templateUrl: './select-wallet-dialog.component.html',
  styleUrls: ['./select-wallet-dialog.component.scss']
})
export class SelectWalletDialogComponent implements OnInit {
  ngOnInit(): void {
  }

  constructor(private _bottomSheetRef: MatBottomSheetRef<SelectWalletDialogComponent>) {}

  openLink(event: MouseEvent): void {
    // this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
