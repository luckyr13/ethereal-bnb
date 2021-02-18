import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletProviderService } from '../auth/wallet-provider.service';

@Component({
  templateUrl: './wrong-network.component.html',
  styleUrls: ['./wrong-network.component.scss']
})
export class WrongNetworkComponent implements OnInit {
	public validNetworkName: string = '';

  constructor(
  	private router: Router,
  	private wps: WalletProviderService
  ) { }

  ngOnInit(): void {
  	this.validNetworkName = this.wps.getMainNetworkNameDeployedContracts();
  }

  goBackHome() {
  	this.router.navigate(['/home']);
  }

}
