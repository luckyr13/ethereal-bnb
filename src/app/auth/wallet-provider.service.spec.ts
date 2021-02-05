import { TestBed } from '@angular/core/testing';

import { WalletProviderService } from './wallet-provider.service';

describe('WalletProviderService', () => {
  let service: WalletProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
