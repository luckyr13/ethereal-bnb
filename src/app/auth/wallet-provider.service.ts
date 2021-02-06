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

 async setWeb3(provider: any) {
    this.web3 = new Web3(provider);
    const ac1 = await this.web3.eth.requestAccounts();
    console.log('accs 1', ac1);
    
    const accounts = await this.web3.eth.getAccounts();
    console.log('accs', accounts);
  }

  async requestAccounts() {
    let accounts;
    try {
      accounts = await this.web3.eth.requestAccounts();
    } catch (err) {
      throw Error('Err ${err}');
    }
    return accounts;
  }

  async getAccounts() {
    let accounts;
    try {
      accounts = await this.web3.eth.getAccounts();
    } catch (err) {
      throw Error('Err ${err}');
    }
    return accounts;
  }

  async getNetworkId() {
    const networkId = await this.web3.eth.net.getId();
    return networkId;
  }

  detectBinanceWallet(): boolean {
    const provider = window && window.BinanceChain ? window.BinanceChain : null;
    if (!!provider) {
      this.setWeb3(provider);
      return true;
    }

    return false;
  }

  async detectMetamaskWallet() {
    const provider = window && window.ethereum ? window.ethereum : null;
    if (!!provider) {
      await this.setWeb3(provider);
      return true;
    }

    return false;
  }


}
