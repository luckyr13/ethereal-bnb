import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrongNetworkComponent } from './wrong-network.component';

describe('WrongNetworkComponent', () => {
  let component: WrongNetworkComponent;
  let fixture: ComponentFixture<WrongNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WrongNetworkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrongNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
