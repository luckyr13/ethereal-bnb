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
	// local
	//private _contractAddress: string = '0x956FeC9fDAAb06DA62C056ae3509a3897938Fb9C';
	
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
		_name = this._padHex(_name, 64)
		return await this.contract.methods.characterNameExists(_name).call();
	}

	public async getCharacterMetadata(_tokenId: string): Promise<any>  {
		let res = {
			characterBaseMetadata: null,
			characterPhysicalMetadata: null,
			characterAttributesMetadata: null
		};
		try {
			let characterBaseMetadata = await this.contract.methods.characterBaseMetadata(_tokenId).call();
			let characterPhysicalMetadata = await this.contract.methods.characterPhysicalMetadata(_tokenId).call();
			let characterAttributesMetadata = await this.contract.methods.characterAttributesMetadata(_tokenId).call();

			// Parse hex fields to utf8 
			characterBaseMetadata.name = this.hexToUtf8(characterBaseMetadata.name);
			characterBaseMetadata.description = this.hexToUtf8(characterBaseMetadata.description);
			characterBaseMetadata.birthdate = this.hexToUtf8(characterBaseMetadata.birthdate);

			res.characterBaseMetadata = characterBaseMetadata;
			res.characterPhysicalMetadata = characterPhysicalMetadata;
			res.characterAttributesMetadata = characterAttributesMetadata;
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

	private _padHex(_s: string, _n: number) {
		const res = this.wps.web3.utils.padLeft(
			this.wps.web3.utils.utf8ToHex(_s), _n
		);
		return res;
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

	public async getAllMyCharacters(_account: string, _totalCharacters: number) {
		let res = [];
		try {
			const totalSupply = await this.contract.methods.totalSupply().call();
			for (let i = 0; i < totalSupply; i++) {
				if (await this.contract.methods.ownerOf(i).call() == _account) {
					let metadata = await this.getCharacterMetadata(''+i);
					metadata.id = i;
					res.push(metadata);
				}
				if (res.length == _totalCharacters) {
					break;
				}
			}

		} catch (err) {
			throw Error(err);
		}
		return res;
	}
	
	



}