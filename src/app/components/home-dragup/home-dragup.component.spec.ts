import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDragupComponent } from './home-dragup.component';

describe('HomeDragupComponent', () => {
  let component: HomeDragupComponent;
  let fixture: ComponentFixture<HomeDragupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeDragupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeDragupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
