import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PilotInfoComponent } from './pilot-info.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PilotInfoComponent', () => {
  let component: PilotInfoComponent;
  let fixture: ComponentFixture<PilotInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PilotInfoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PilotInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
