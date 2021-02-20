import { Injectable } from '@angular/core';
import * as EtherealGameABI from './abi/EtherealGameABI.json';
import { WalletProviderService } from '../auth/wallet-provider.service';
import { IEtherealPlayer } from './IEtherealPlayer';
import { EtherealCharacterService } from './EtherealCharacter.service';
import {ICharacterBaseMetadata} from './ICharacterBaseMetadata';
import {ICharacterPhysicalMetadata} from './ICharacterPhysicalMetadata';
import {ICharacterAttributesMetadata} from './ICharacterAttributesMetadata';

@Injectable({
  providedIn: 'root'
})
export class EtherealGameService
{
	// BSC Testnet
	private _contractAddress: string = '0xB775ae662C2Ba38eC533317ba776F97daebD6D71';
	// local
	//private _contractAddress: string = '0x117Fb568de6399D35F80A526fd853518B2Aa2F43';
	
	public contract: any = null;

	constructor(
		private wps: WalletProviderService,
		private etherealCharacter: EtherealCharacterService
	) {
		
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
			return this.contract.methods.registerPlayer(_nickname).send({
				from: _account,
				gas: 1000000
			});
		} catch (err) {
			throw Error(err);
		}
	}

	public async getNumPlayers(): Promise<any> {
		return this.contract.methods.numPlayers().call();
	}

	public async getFightRequestMetadata(_account: string, _fightRequestId: number): Promise<any> {
		return this.contract.methods.fightRequests(_account, _fightRequestId).call();
	}

	public async getTotalFightRequests(_account: string): Promise<any> {
		return this.contract.methods.totalFightRequests(_account).call();
	}

	public async getProbabilityOfWinningAgainstElem(_elementOfNatureId: string): Promise<any> {
		return this.contract.methods.probabilityOfWinningAgainstElem(_elementOfNatureId).call();
	}

	public async getPlayerData(_account: string): Promise<IEtherealPlayer> {
		return this.contract.methods.playerData(_account).call();
	}

	public hexToUtf8(_s: string): string {
		return this.wps.web3.utils.hexToUtf8(_s);
	}

	public async getAllFighters(_totalFighters: number, _myAccount: string) {
		let res: any = [];
		this.etherealCharacter.init();
		try {
			for (let i = 0; i < _totalFighters; i++) {
				const address = await this.contract.methods.players(i).call();
				let numCharacters = 0;
				if (address != _myAccount) {
					numCharacters = await this.etherealCharacter.getBalanceOf(address);
				}
				// If player has characters, get metadata
				if (numCharacters > 0) {
					const metadata: IEtherealPlayer = await this.getPlayerData(address);
					metadata.nickname = this.wps.web3.utils.hexToUtf8(metadata.nickname);
					res.push({address: address, metadata: metadata, numCharacters: numCharacters});
				}

				
			}

		} catch (err) {
			throw Error(err);
		}
		console.log(res);
		return res;
	}

	public async createCharacter(
		_to: string,
		_baseData: ICharacterBaseMetadata,
		_physicalData: ICharacterPhysicalMetadata,
		_attributesData: ICharacterAttributesMetadata
	): Promise<any> {
		try {
			_baseData.name = this._padHex(_baseData.name, 64);
			_baseData.description = this._padHex(_baseData.description, 64);
			_baseData.birthdate = this._padHex(_baseData.birthdate, 48);

			return this.contract.methods.createCharacter(_baseData, _physicalData, _attributesData).send({
				from: _to,
				gas: 1000000
				// gasPrice: 127000000000
			});
		} catch (err) {
			throw Error(err);
		}
	}

	private _padHex(_s: string, _n: number) {
		const res = this.wps.web3.utils.padLeft(
			this.wps.web3.utils.utf8ToHex(_s), _n
		);
		return res;
	}

	public async requestFight(
		_opponent: string,
		_myCharacterId: string,
		_myAccount: string
	): Promise<any> {
		try {

			return this.contract.methods.requestFight(_opponent, _myCharacterId).send({
				from: _myAccount,
				gas: 1000000
			});
		} catch (err) {
			throw Error(err);
		}
	}

	public setRequestFightListeners(account: string, account2: string, _callback: any) {
		this.contract.events.NewFightRequest({
		    filter: {player1: [account], player2: [account2]},
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

	public async acceptFight(
		_fightRequestId: string,
		_myCharacterId: string,
		_myAccount: string,
	): Promise<any> {
		try {

			return this.contract.methods.acceptFight(_fightRequestId, _myCharacterId).send({
				from: _myAccount,
				gas: 1000000
			});
		} catch (err) {
			throw Error(err);
		}
	}

	public setAcceptFightListeners(account: string, account2: string, _callback: any) {
		this.contract.events.NewFightRequestAccepted({
		    filter: {player1: [account], player2: [account2]},
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