import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerInfoGeneralInfoComponent } from './player-info-general-info.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PlayerInfoGeneralInfoComponent', () => {
  let component: PlayerInfoGeneralInfoComponent;
  let fixture: ComponentFixture<PlayerInfoGeneralInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerInfoGeneralInfoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerInfoGeneralInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
