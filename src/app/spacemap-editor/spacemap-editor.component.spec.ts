import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpacemapEditorComponent } from './spacemap-editor.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

describe('SpacemapEditorComponent', () => {
  let component: SpacemapEditorComponent;
  let fixture: ComponentFixture<SpacemapEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpacemapEditorComponent, RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SpacemapEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
