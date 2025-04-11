import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryActiveShipComponent } from './inventory-active-ship.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('InventoryActiveShipComponent', () => {
  let component: InventoryActiveShipComponent;
  let fixture: ComponentFixture<InventoryActiveShipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryActiveShipComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryActiveShipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
