import { Injectable } from '@angular/core';
declare const window: any;
import Web3 from 'web3';


@Injectable({
  providedIn: 'root'
})
export class WalletProviderService {
	public metamaskProvider: any;
	public cryptoWalletsProvider: any;
	public binanceProvider: any;
	public trustWalletProvider: any;
	public web3: any;

  constructor() {
  	this.metamaskProvider = window.ethereum ? window.ethereum : null;
  	this.cryptoWalletsProvider = window.ethereum ? window.ethereum : null;
  	this.binanceProvider = window.BinanceChain ? window.BinanceChain : null;
  }

  initWeb3() {
  	const provider = this.getProvider();
  	const web3 = new Web3(provider);
  	return web3;
  }

  isMetamask(): boolean {
  	return !!this.metamaskProvider;
  }

  isCryptoWallets(): boolean {
  	return !!this.cryptoWalletsProvider;
  }

  isBinance(): boolean {
  	return !!this.binanceProvider;
  }

  getProvider() {
  	let provider = null;
  	if (this.isMetamask()) {
  		provider = this.metamaskProvider;
  	} else if (this.isCryptoWallets()) {
  		provider = this.cryptoWalletsProvider;
  	} else if (this.isBinance()) {
  		provider = this.binanceProvider;
  	}

  	if (!provider) {
  		throw 'Wallet not detected. Please install one';
  	}

  	return provider;
  }




}
