import { Injectable } from '@angular/core';
import * as KopernikTokenABI from './abi/KopernikTokenABI.json';
import { WalletProviderService } from '../auth/wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class KopernikTokenService
{
	// BSC Testnet
	private _contractAddress: string = '0x8A1C5607D5e0bAdf8929EDbbB80906164100778B';
	// Local
	//private _contractAddress: string = '0xC4ADa952Af1C6Ad0802a22c407dAB66d3E515C04';
	
	public contract: any = null;

	constructor(private wps: WalletProviderService) {
		
	}

	public getContractAddress(): string {
		return this._contractAddress;
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

	public async getAllowedBalanceForEtherealGame(_owner: string, _spender: string): Promise<any> {
		let balance = 0;
		try {
			balance = await this.contract.methods.allowance(_owner, _spender).call();
		} catch (err) {
			throw Error(err);
		}
		return balance;
	}

	public async approveAllowance(
		_spender: string,
		_amount: string,
		_owner: string
	): Promise<any> {
		try {

			return this.contract.methods.approve(_spender, _amount).send({
				from: _owner,
				gas: 1000000
			});
		} catch (err) {
			throw Error(err);
		}
	}

	public setApproveAllowanceListeners(owner: string, _callback: any) {
		this.contract.events.Approval({
		    filter: {owner: [owner]},
		    fromBlock: 0
		}, function(error: any, event: any){ _callback(event); })
		.on("connected", function(subscriptionId: any){
		    console.log('Event NewFightRequest connected', subscriptionId);
		})
		.on('changed', function(event: any){
		    // remove event from local 
		    console.error('Event NewFightRequest changed error', event)
		})
		.on('error', function(error: any, receipt: any) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
		    console.error('Event NewFightRequest error', error, receipt)
		});
	}



}