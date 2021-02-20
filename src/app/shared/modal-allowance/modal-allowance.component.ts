import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EtherealGameService } from '../../contracts/EtherealGame.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KopernikTokenService } from '../../contracts/KopernikToken.service';
declare const window: any;

@Component({
  templateUrl: './modal-allowance.component.html',
  styleUrls: ['./modal-allowance.component.scss']
})
export class ModalAllowanceComponent implements OnInit {
	isLoading: boolean = false;
  disableButtons: boolean = false;
  balance: string = '0';

 constructor(
  	@Inject(MAT_DIALOG_DATA) public data: {mainAccount: string},
  	private etherealGame: EtherealGameService,
    private kopernik: KopernikTokenService,
    private snackbar: MatSnackBar
  ) { }

  async ngOnInit() {
    try {
      this.isLoading = true;
      this.balance = await this.kopernik.getBalance(this.data.mainAccount);
      this.balance = `${ parseInt(this.balance) / 100 }`;
      this.isLoading = false;
    } catch (err) {
      console.error(err);
      this.isLoading = false;
      this.message('Error!!', 'error')
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

  formatLabel(value: number) {
    return value;
  }

  async approve(_amount: any) {
    try {
      this.isLoading = true;
      _amount = parseInt(_amount) * 100;
      const spender = this.etherealGame.getContractAddress();
      await this.kopernik.approveAllowance(spender, `${_amount}`, this.data.mainAccount);
      this.kopernik.setApproveAllowanceListeners(this.data.mainAccount, () => {
        this.message('Approval success!', 'success');
        window.location.reload();

      })
      // this.isLoading = false;
    } catch (err) {
      console.error(err);
      this.isLoading = false;
      this.message('Error!!', 'error')
    }
  }


}
