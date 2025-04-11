import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAllItemsComponent } from './inventory-all-items.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('InventoryAllItemsComponent', () => {
  let component: InventoryAllItemsComponent;
  let fixture: ComponentFixture<InventoryAllItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryAllItemsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryAllItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
