import { Injectable } from '@angular/core';
import * as EtherealPlanetABI from './abi/EtherealPlanetABI.json';
import { WalletProviderService } from '../auth/wallet-provider.service';
import {ICharacterBaseMetadata} from './ICharacterBaseMetadata';
import {ICharacterPhysicalMetadata} from './ICharacterPhysicalMetadata';
import {ICharacterAttributesMetadata} from './ICharacterAttributesMetadata';

@Injectable({
  providedIn: 'root'
})
export class EtherealPlanetService
{
	// BSC Testnet
	private _contractAddress: string = '0x62AC806a90977B5799F9622Ad04842A01c339Bc6';
	
	public contract: any = null;

	constructor(private wps: WalletProviderService) {
		
	}

	public init() {
		this.contract = new this.wps.web3.eth.Contract(EtherealPlanetABI.abi, this._contractAddress);
	}

	public getContractAddress(): string {
		return this._contractAddress;
	}

	private _padHex(_s: string, _n: number) {
		const res = this.wps.web3.utils.padLeft(
			this.wps.web3.utils.utf8ToHex(_s), _n
		);
		return res;
	}

	public hexToUtf8(_s: string): string {
		return this.wps.web3.utils.hexToUtf8(_s);
	}

	public async getPlanets() {
		const planets = await this.contract.methods.getPlanets().call();
		let planetsMetadata = [];

		for (let p of planets) {
			const tmpPlanet = await this.contract.methods.planets(p).call();
			tmpPlanet['id'] = p;
			tmpPlanet['name'] = this.hexToUtf8(tmpPlanet['name']);
			if (tmpPlanet['name'].trim() == '') {
				continue;
			}
			planetsMetadata.push(tmpPlanet);
		}

		return planetsMetadata;
	}

	
	



}