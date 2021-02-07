import { Injectable } from '@angular/core';
declare const window: any;
import Web3 from 'web3';
import { UserSettingsService } from './user-settings.service';

@Injectable({
  providedIn: 'root'
})
export class WalletProviderService {
	public web3: any;
  public accounts: string[];

  constructor(private userSettings: UserSettingsService) {
    this.accounts = [];
  }

 setWeb3(provider: any) {
    this.web3 = new Web3(provider);
  }

  async requestAccounts() {
    try {
      this.accounts = await this.web3.eth.requestAccounts();
    } catch (err) {
      throw Error('Err ${err}');
    }
    return this.accounts;
  }

  async getAccounts() {
    try {
      this.accounts = await this.web3.eth.getAccounts();
    } catch (err) {
      throw Error('Err ${err}');
    }
    return this.accounts;
  }

  async getNetworkId() {
    const networkId = await this.web3.eth.net.getId();
    return networkId;
  }

  detectBinanceWallet(): boolean {
    const provider = window && window.BinanceChain ? window.BinanceChain : null;
    if (!!provider) {
      try {
        this.setWeb3(provider);
      } catch (err) {
        throw Error(`detectWallet: ${err}`);
      }
      return true;
    }

    return false;
  }

  detectMetamaskWallet() {
    const provider = window && window.ethereum ? window.ethereum : null;
    if (!!provider) {
      try {
        this.setWeb3(provider);
      } catch (err) {
        throw Error(`detectWallet: ${err}`);
      }
      return true;
    }

    return false;
  }


}
