import { Injectable } from '@angular/core';
declare const window: any;
import Web3 from 'web3';

@Injectable({
  providedIn: 'root'
})
export class WalletProviderService {
	public web3: any;

  constructor() {
  }

 setWeb3(provider: any) {
    this.web3 = new Web3(provider);
  }

  async requestAccounts() {
    const accounts = await this.web3.eth.requestAccounts();
    return accounts;
  }

  async getAccounts() {
    const accounts = await this.web3.eth.getAccounts();
    
    return accounts;
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
