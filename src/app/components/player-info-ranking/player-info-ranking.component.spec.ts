import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerInfoRankingComponent } from './player-info-ranking.component';

describe('PlayerInfoRankingComponent', () => {
  let component: PlayerInfoRankingComponent;
  let fixture: ComponentFixture<PlayerInfoRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerInfoRankingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerInfoRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
