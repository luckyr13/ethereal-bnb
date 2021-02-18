import { Injectable } from '@angular/core';
import * as KopernikTokenABI from './abi/KopernikTokenABI.json';
import { WalletProviderService } from '../auth/wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class KopernikTokenService
{
	// Local
	//private _contractAddress: string = '0xb1E92aF22F097948211f1F120D0340e103851619';
	// BSC Testnet
	private _contractAddress: string = '0x8A1C5607D5e0bAdf8929EDbbB80906164100778B';
	
	public contract: any = null;

	constructor(private wps: WalletProviderService) {
		
	}

	public init() {
		this.contract = new this.wps.web3.eth.Contract(KopernikTokenABI.abi, this._contractAddress);
	}

	public async getBalance(_account: string): Promise<any> {
		let balance = 0;
		try {
			balance = await this.contract.methods.balanceOf(_account).call();
		} catch (err) {
			throw Error(err);
		}
		return balance;
	}


}