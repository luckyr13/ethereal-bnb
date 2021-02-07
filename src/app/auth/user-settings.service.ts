import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
	private _wallet: string;

  constructor() {
  	this._wallet = '';
  }
}
