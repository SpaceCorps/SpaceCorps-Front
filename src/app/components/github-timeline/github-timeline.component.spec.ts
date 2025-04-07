import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GithubTimelineComponent } from './github-timeline.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('GithubTimelineComponent', () => {
  let component: GithubTimelineComponent;
  let fixture: ComponentFixture<GithubTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GithubTimelineComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GithubTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
