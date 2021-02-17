import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
	private wallet: Subject<string>;
	private account: Subject<string>;
	private networkId: Subject<string>;
	private network: Subject<string>;
  private playerBalance: Subject<string>;
	
	// Observable string streams
  public account$: Observable<string>;
  public networkId$: Observable<string>;
  public network$: Observable<string>;
  public wallet$: Observable<string>;
  public playerBalance$: Observable<string>;

	setWallet(option: string) {
    this.wallet.next(option);
		window.localStorage.setItem('wallet', option);
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

  setPlayerBalance(account: string) {
    this.playerBalance.next(account);
  }

  getWalletOptionOnLocalStorage() {
    return window.localStorage.getItem('wallet');
  }

  constructor() {
  	this.account = new Subject<string>();
  	this.networkId = new Subject<string>();
  	this.network = new Subject<string>();
    this.wallet = new Subject<string>();
    this.playerBalance = new Subject<string>();
    
  	this.account$ = this.account.asObservable();
  	this.networkId$ = this.networkId.asObservable();
  	this.network$ = this.network.asObservable();
    this.wallet$ = this.network.asObservable();
    this.playerBalance$ = this.playerBalance.asObservable();

    this.setWallet(window.localStorage.getItem('wallet'));

  }

  saveUserSettings(
    account: string,
    networkId: string,
    network: string,
    wallet: string
  ) {
    this.setWallet(wallet);
    this.setAccount(account);
    this.setNetworkId(networkId);
    this.setNetwork(network);
  }

  deleteUserSettings() {
    window.localStorage.removeItem('wallet');
    this.setWallet('');
    this.setAccount('');
    this.setNetworkId('');
    this.setNetwork('');
  }
}
