import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerInfoStatisticsComponent } from './player-info-statistics.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PlayerInfoStatisticsComponent', () => {
  let component: PlayerInfoStatisticsComponent;
  let fixture: ComponentFixture<PlayerInfoStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerInfoStatisticsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerInfoStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
