import { Injectable } from '@angular/core';
import { WalletProviderService } from './wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private wps: WalletProviderService) { }

  /*
  *	
  */
  async connectWallet(option: string) {
		switch (option) {
			/*
			* 1. Binance
			*/
			case 'binance':
				await this.connectBinanceWallet();
			break;
			/*
			* 2. Metamask
			*/
			case 'metamask':
				await this.connectMetamaskWallet();

			break;
			default:
				// Nothing to do
				throw Error('Option not found');
			break;
		}  	

  }

  async connectBinanceWallet() {
  	// 1. Detect the Binance Smart Chain provider (window.BinanceChain)
		if (this.wps.detectBinanceWallet()) {
			try {
			// 2. Detect which Binance Smart Chain network the user is connected to. 
				const netId = await this.wps.getNetworkId();
				console.log('Net: ', netId)
			// If Binance Chain is selected, you can fire a network switch request.

				// 3. Get the user's Binance Smart Chain account(s)
				const accounts = await this.wps.requestAccounts();
				console.log('Accounts 1 req: ', accounts)

			} catch (err) {
				throw Error(`Error: ${err}`);
			}

		} else {
			throw Error('Binance Chain Wallet not detected');
		}
  }

  async connectMetamaskWallet() {
  	// 1. Detect the Ethereum provider (window.ethereum)
		if (this.wps.detectMetamaskWallet()) {
			try {
				// 2. Detect which Ethereum network the user is connected to
				const netId = await this.wps.getNetworkId();
				console.log('Net: ', netId)
				// 3. Get the user's Ethereum account(s)
				const accounts = await this.wps.requestAccounts();
				console.log('Accounts 1 req: ', accounts)
			} catch (err) {
				throw Error(`Error: ${err}`);
			}

		} else {
			throw Error('Metamask Wallet not detected');
		}
  }

}
