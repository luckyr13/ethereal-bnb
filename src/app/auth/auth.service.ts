import { Injectable } from '@angular/core';
import { WalletProviderService } from './wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
  	private wps: WalletProviderService
  ) { }

  /*
  *	
  */
  async connectWallet(option: string) {
  	let res = { networkId: '', account: '', networkName: ''};

		switch (option) {
			/*
			* 1. Binance
			*/
			case 'binance':
				res = await this.connectBinanceWallet();
			break;
			/*
			* 2. Metamask
			*/
			case 'metamask':
				res = await this.connectMetamaskWallet();
			break;
			default:
				// Nothing to do
				throw Error('Option not found');
			break;
		}

		return res;

  }

  async connectBinanceWallet() {
  	let res = { networkId: '', account: '', networkName: ''};

  	// 1. Detect the Binance Smart Chain provider (window.BinanceChain)
		if (this.wps.detectBinanceWallet()) {
			try {
				// 2. Detect which Binance Smart Chain network the user is connected to. 
				res['networkId'] = await this.wps.getNetworkId();
				res['networkName'] = this.wps.getNetworkName(res['networkId']);
				// If Binance Chain is selected, you can fire a network switch request.

				// 3. Get the user's Binance Smart Chain account(s)
				const accounts = await this.wps.requestAccounts();
				if (!accounts) {
					throw Error(`Error: Main account not found`);
				} else {
					res['account'] = accounts[0];
				}

			} catch (err) {
				const errMessage = Object.prototype.hasOwnProperty.call(err, 'message') ?
					err.message : 'Error connecting to wallet';
				throw Error(`${errMessage}`);
			}

		} else {
			throw Error('Binance Chain Wallet not detected');
		}

		return res;
  }

  async connectMetamaskWallet() {
  	let res = { networkId: '', account: '', networkName: ''};
  	// 1. Detect the Ethereum provider (window.ethereum)
		if (this.wps.detectMetamaskWallet()) {
			try {
				// 2. Detect which Ethereum network the user is connected to
				res['networkId'] = await this.wps.getNetworkId();
				res['networkName'] = this.wps.getNetworkName(res['networkId']);
				
				// 3. Get the user's Ethereum account(s)
				const accounts = await this.wps.requestAccounts();
				if (!accounts) {
					throw Error(`Error: Main account not found`);
				} else {
					res['account'] = accounts[0];
				}
			} catch (err) {
				const errMessage = Object.prototype.hasOwnProperty.call(err, 'message') ?
					err.message : 'Error connecting to wallet';
				throw Error(`${errMessage}`);
			}

		} else {
			throw Error('Metamask Wallet not detected');
		}

		return res;
  }

  setWalletChangeListeners() {
  	this.wps.onAccountsChanged();
  	this.wps.onChainChanged();
  	this.wps.onDisconnect();
  }



}
