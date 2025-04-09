import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerInfoLatestActivityComponent } from './player-info-latest-activity.component';

describe('PlayerInfoLatestActivityComponent', () => {
  let component: PlayerInfoLatestActivityComponent;
  let fixture: ComponentFixture<PlayerInfoLatestActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerInfoLatestActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerInfoLatestActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
