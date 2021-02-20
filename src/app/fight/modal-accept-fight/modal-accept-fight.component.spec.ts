import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAcceptFightComponent } from './modal-accept-fight.component';

describe('ModalAcceptFightComponent', () => {
  let component: ModalAcceptFightComponent;
  let fixture: ComponentFixture<ModalAcceptFightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAcceptFightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAcceptFightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
