import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseVisuComponent } from './base-visu.component';

describe('BaseVisuComponent', () => {
  let component: BaseVisuComponent;
  let fixture: ComponentFixture<BaseVisuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseVisuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BaseVisuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
