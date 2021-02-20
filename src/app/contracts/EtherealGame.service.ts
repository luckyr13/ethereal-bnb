import { Injectable } from '@angular/core';
import * as EtherealGameABI from './abi/EtherealGameABI.json';
import { WalletProviderService } from '../auth/wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class EtherealGameService
{
	// BSC Testnet
	private _contractAddress: string = '0xB775ae662C2Ba38eC533317ba776F97daebD6D71';
	
	public contract: any = null;

	constructor(private wps: WalletProviderService) {
		
	}

	public init() {
		this.contract = new this.wps.web3.eth.Contract(EtherealGameABI.abi, this._contractAddress);
	}

	public getContractAddress(): string {
		return this._contractAddress;
	}

	public async getPlayerIsRegistered(_account: string): Promise<any> {
		return await this.contract.methods.playerIsRegistered(_account).call();
	}

	public async getPlayerNicknameExists(_nickname: string): Promise<any>  {
		_nickname = this.wps.web3.utils.utf8ToHex(_nickname);
		return await this.contract.methods.playerNicknameExists(_nickname).call();
	}

	public setRegisterPlayerListeners(account: string, _callback: any) {
		this.contract.events.NewPlayerRegistered({
		    filter: {player: [account]},
		    fromBlock: 0
		}, function(error: any, event: any){ _callback(event); })
		.on("connected", function(subscriptionId: any){
		    console.log('Event connected', subscriptionId);
		})
		.on('changed', function(event: any){
		    // remove event from local 
		    console.error('Event registerPlayer changed error', event)
		})
		.on('error', function(error: any, receipt: any) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
		    console.error('Event registerPlayer error', error, receipt)
		});
	}

	public async registerPlayer(_nickname: string, _account: string): Promise<any> {
		try {
			_nickname = this.wps.web3.utils.utf8ToHex(_nickname);
			return this.contract.methods.registerPlayer(_nickname).send({from: _account});
		} catch (err) {
			throw Error(err);
		}
	}

	public async getNumPlayers(): Promise<any> {
		return this.contract.methods.numPlayers().call();
	}

	public async getFightRequests(_account: string): Promise<any> {
		return this.contract.methods.fightRequests(_account).call();
	}

	public async getTotalFightRequests(_account: string): Promise<any> {
		return this.contract.methods.totalFightRequests(_account).call();
	}

	public async getProbabilityOfWinningAgainstElem(_elementOfNatureId: string): Promise<any> {
		return this.contract.methods.probabilityOfWinningAgainstElem(_elementOfNatureId).call();
	}

	public async getPlayerData(_account: string): Promise<any> {
		return this.contract.methods.playerData(_account).call();
	}

	public hexToUtf8(_s: string): string {
		return this.wps.web3.utils.hexToUtf8(_s);
	}

	public async getAllFighters(_totalFighters: number) {
		let res: any = [];
		try {
			for (let i = 0; i < _totalFighters; i++) {
				const address = await this.contract.methods.players(i).call();
				const metadata = await this.getPlayerData(address);
				res.push({address: address, metadata: metadata});
			}

		} catch (err) {
			throw Error(err);
		}
		console.log(res);
		return res;
	}
	
	



}