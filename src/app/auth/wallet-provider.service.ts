import { Injectable } from '@angular/core';
declare const window: any;
import Web3 from 'web3';

@Injectable({
  providedIn: 'root'
})
export class WalletProviderService {
	public web3: any;
  private networkIdToName: any = {
      1: 'ETH Mainnet (1)',
      3: 'ETH Ropsten (3)',
      42: 'ETH Kovan (42)',
      4: 'ETH Rinkeby (4)',
      5: 'ETH Goerli (5)',
      56: 'Binance Smart Chain (56)',
  };

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

  public getNetworkName(networkId: string) {
    const network: string = Object.prototype.hasOwnProperty.call(
      this.networkIdToName,
      networkId
    ) ? this.networkIdToName[networkId] : `NetworkId=${networkId}`;
    return network;
  }

  /*
  *  It doesn't work
  */
  logout() {
    if (this.web3 && this.web3.close) {
      this.web3.close();
    }
  }


}
