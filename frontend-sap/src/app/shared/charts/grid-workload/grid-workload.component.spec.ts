import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridWorkloadComponent } from './grid-workload.component';

describe('GridWorkloadComponent', () => {
  let component: GridWorkloadComponent;
  let fixture: ComponentFixture<GridWorkloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridWorkloadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GridWorkloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
