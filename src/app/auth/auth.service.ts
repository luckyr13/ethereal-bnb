import { Injectable } from '@angular/core';
import { WalletProviderService } from './wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private wps: WalletProviderService) { }

  login() {
  	

  }

}
