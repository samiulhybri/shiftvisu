import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolOverviewComponent } from './tool-overview.component';

describe('ToolOverviewComponent', () => {
  let component: ToolOverviewComponent;
  let fixture: ComponentFixture<ToolOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToolOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
