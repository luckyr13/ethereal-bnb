import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectWalletDialogComponent } from './select-wallet-dialog.component';

describe('SelectWalletDialogComponent', () => {
  let component: SelectWalletDialogComponent;
  let fixture: ComponentFixture<SelectWalletDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectWalletDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectWalletDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
