import { Injectable } from '@angular/core';
import { WalletProviderService } from './wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private wps: WalletProviderService) { }

  /*
  *	Option:
  *	1. Binance
  * 2. Metamask
  */
  async connect(option: number) {
		switch (option) {
			/*
			* 1. Binance
			*/
			case 1:
				// 1. Detect the Binance Smart Chain provider (window.BinanceChain)
				if (this.wps.detectBinanceWallet()) {
					// 2. Detect which Binance Smart Chain network the user is connected to. 
					// If Binance Chain is selected, you can fire a network switch request.
					
					// 3. Get the user's Binance Smart Chain account(s)
					try {

						const netId = await this.wps.getNetworkId();
						console.log('Net: ', netId)

						const accounts = await this.wps.requestAccounts();
						console.log('Accounts 1: ', accounts)
						const accounts2 = await this.wps.getAccounts();
						console.log('Accounts 2: ', accounts2)

						const netIds = await this.wps.getNetworkId();
						console.log('Net 2: ', netIds)
					} catch (err) {
						console.log('Errrrrrrr', err)
						throw Error(`Error: ${err}`);
					}

				} else {
					throw Error('Binance Chain Wallet not detected');
				}
			break;
			/*
			* 2. Metamask
			*/
			case 2:
				// 1. Detect the Ethereum provider (window.ethereum)
				if (await this.wps.detectMetamaskWallet()) {
					// 2. Detect which Ethereum network the user is connected to
					// 3. Get the user's Ethereum account(s)
					try {
						console.log('web3', this.wps.web3);
						
						const accounts = await this.wps.requestAccounts();
						console.log('Accounts 1: ', accounts)
						const accounts2 = await this.wps.getAccounts();
						console.log('Accounts 2: ', accounts2)

						const netIds = await this.wps.getNetworkId();
						console.log('Net 2: ', netIds)
					} catch (err) {
						console.log('Errrrrrrr', err)
						throw Error(`Error: ${err}`);
					}

				} else {
					throw Error('Metamask Wallet not detected');
				}
				

			break;
			default:
				// Nothing to do
			break;
		}  	

  	


  }

}
