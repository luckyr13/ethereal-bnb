import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAllowanceComponent } from './modal-allowance.component';

describe('ModalAllowanceComponent', () => {
  let component: ModalAllowanceComponent;
  let fixture: ComponentFixture<ModalAllowanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAllowanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAllowanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
