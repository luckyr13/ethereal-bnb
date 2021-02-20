import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSearchFighterComponent } from './modal-search-fighter.component';

describe('ModalSearchFighterComponent', () => {
  let component: ModalSearchFighterComponent;
  let fixture: ComponentFixture<ModalSearchFighterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSearchFighterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSearchFighterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
