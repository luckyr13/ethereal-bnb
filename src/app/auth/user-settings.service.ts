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
	// Observable string streams
  public account$: Observable<string>;
  public networkId$: Observable<string>;


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

  constructor() {
  	this._wallet = window.localStorage.getItem('wallet');
  	this.account = new Subject<string>();
  	this.networkId = new Subject<string>();
  	this.account$ = this.account.asObservable();
  	this.networkId$ = this.networkId.asObservable();
  }
}
