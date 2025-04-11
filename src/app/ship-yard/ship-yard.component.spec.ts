import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipYardComponent } from './ship-yard.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ShipYardComponent', () => {
  let component: ShipYardComponent;
  let fixture: ComponentFixture<ShipYardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipYardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipYardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
