import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipModelComponent } from './ship-model.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ShipModelComponent', () => {
  let component: ShipModelComponent;
  let fixture: ComponentFixture<ShipModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipModelComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
