import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySelectedItemComponent } from './inventory-selected-item.component';

describe('InventorySelectedItemComponent', () => {
  let component: InventorySelectedItemComponent;
  let fixture: ComponentFixture<InventorySelectedItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventorySelectedItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InventorySelectedItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
