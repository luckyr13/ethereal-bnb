import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
	private _wallet: string;
	private account: Subject<string>;
	private networkId: Subject<string>;
	private network: Subject<string>;
	
	// Observable string streams
  public account$: Observable<string>;
  public networkId$: Observable<string>;
  public network$: Observable<string>;


	get wallet(): string {
		return this._wallet;
	}

	set wallet(option: string) {
		window.localStorage.setItem('wallet', option);
		this._wallet = option;
	}

	setAccount(account: string) {
		this.account.next(account);
	}

	setNetworkId(networkId: string) {
		this.networkId.next(networkId);
	}

	setNetwork(network: string) {
		this.network.next(network);
	}

  constructor() {
  	this._wallet = window.localStorage.getItem('wallet');
  	this.account = new Subject<string>();
  	this.networkId = new Subject<string>();
  	this.network = new Subject<string>();
  	
  	this.account$ = this.account.asObservable();
  	this.networkId$ = this.networkId.asObservable();
  	this.network$ = this.network.asObservable();
  }

  saveUserSettings(
    account: string,
    networkId: string,
    network: string,
    wallet: string
  ) {
    this.setAccount(account);
    this.setNetworkId(networkId);
    this.setNetwork(network);
    this.wallet = wallet;
  }
}
