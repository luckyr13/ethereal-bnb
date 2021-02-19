import { Injectable } from '@angular/core';
import * as EtherealCharacterABI from './abi/EtherealCharacterABI.json';
import { WalletProviderService } from '../auth/wallet-provider.service';
import {ICharacterBaseMetadata} from './ICharacterBaseMetadata';
import {ICharacterPhysicalMetadata} from './ICharacterPhysicalMetadata';
import {ICharacterAttributesMetadata} from './ICharacterAttributesMetadata';

@Injectable({
  providedIn: 'root'
})
export class EtherealCharacterService
{
	// BSC Testnet
	private _contractAddress: string = '0x95FA15DDef966463c8C42279695232F5df6a73A3';
	
	public contract: any = null;

	constructor(private wps: WalletProviderService) {
		
	}

	public init() {
		this.contract = new this.wps.web3.eth.Contract(EtherealCharacterABI.abi, this._contractAddress);
	}

	public getContractAddress(): string {
		return this._contractAddress;
	}

	public async getCharacterNameExists(_name: string): Promise<any> {
		_name = this.wps.web3.utils.utf8ToHex(_name);
		return await this.contract.methods.characterNameExists(_name).call();
	}

	public async getCharacterMetadata(_tokenId: string): Promise<any>  {
		let res = {
			characterBaseMetadata: null,
			characterPhysicalMetadata: null,
			characterAttributesMetadata: null
		};
		try {
			res.characterBaseMetadata = await this.contract.methods.characterBaseMetadata(_tokenId).call();
			res.characterPhysicalMetadata = await this.contract.methods.characterPhysicalMetadata(_tokenId).call();
			res.characterAttributesMetadata = await this.contract.methods.characterAttributesMetadata(_tokenId).call();
		} catch (err) {
			throw err;
		}
		
		return res;
	}

	public setMintedCharacterListeners(account: string, _callback: any) {
		this.contract.events.Transfer({
		    filter: {to: [account]},
		    fromBlock: 0
		}, function(error: any, event: any){ _callback(event); })
		.on("connected", function(subscriptionId: any){
		    console.log('Event Transfer connected', subscriptionId);
		})
		.on('changed', function(event: any){
		    // remove event from local 
		    console.error('Event Transfer changed error', event)
		})
		.on('error', function(error: any, receipt: any) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
		    console.error('Event Transfer error', error, receipt)
		});
	}

	public async mintCharacter(
		_to: string,
		_baseData: ICharacterBaseMetadata,
		_physicalData: ICharacterPhysicalMetadata,
		_attributesData: ICharacterAttributesMetadata
	): Promise<any> {
		try {
			_baseData.name = this.wps.web3.utils.utf8ToHex(_baseData.name);
			_baseData.description = this.wps.web3.utils.utf8ToHex(_baseData.description);
			return this.contract.methods.mint(_to, _baseData, _physicalData, _attributesData).send({from: _to});
		} catch (err) {
			throw Error(err);
		}
	}

	public async getBalanceOf(_account: string) {
		try {
			return this.contract.methods.balanceOf(_account).call();
		} catch (err) {
			throw Error(err);
		}
	}

	public hexToUtf8(_s: string): string {
		return this.wps.web3.utils.hexToUtf8(_s);
	}
	
	



}