import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerInfoClanInfoComponent } from './player-info-clan-info.component';

describe('PlayerInfoClanInfoComponent', () => {
  let component: PlayerInfoClanInfoComponent;
  let fixture: ComponentFixture<PlayerInfoClanInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerInfoClanInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerInfoClanInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
