import { Injectable } from '@angular/core';
import { WalletProviderService } from './wallet-provider.service';
import { UserSettingsService } from './user-settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
  	private wps: WalletProviderService,
    private userSettings: UserSettingsService
  ) { }

  /*
  *	Connect wallet, set wallet listeners and save user settings
  */
  async connectWalletAndSetListeners(_option: string, _errorCallback: any): Promise<any> {
  	let res = {account: '', networkId: '', networkName: ''};
    try {
      res = await this.connectWallet(_option);
      const account = res.account;
      const networkId = res.networkId;
      const network = res.networkName;
      // Validate network 
      if (this.isValidNetworkId(networkId)) {
	      // Set listeners 
	      this.setWalletChangeListeners();
	      // Save user settings
	      this.userSettings.saveUserSettings(account, networkId, network, _option);
      } else {
      	// Update UI network info 
      	this.userSettings.updateNetworkSettings(networkId, network);
      	// Redirect to error page
      	_errorCallback();
      	await new Promise(() => {

      		window.setTimeout(async () => {
		      	// Throw error
		      	throw Error('Invalid network ...');
	      	}, 500)

      	});
      }


    } catch (err) {
      this.userSettings.deleteUserSettings();
      throw err;
    }

    return res;
  }

  /*
  *	Validate network id
  */
  public isValidNetworkId(networkId: string) {
  	return (this.wps.getMainNetworkIdDeployedContracts() == networkId);
  }

  /*
  *	Connect wallet
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
  }

  async getMainAccount() {
  	let account = '';
  	try {
  		account = await this.wps.getAccounts();
  		if (account.length) {
  			account = account[0];
  		}
  	} catch (err) {
  		// throw err;
  	}
  	return account;
  }



}
