import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedBulletColumnLineChartComponent } from './combined-bullet-column-line-chart.component';

describe('CombinedBulletColumnLineChartComponent', () => {
  let component: CombinedBulletColumnLineChartComponent;
  let fixture: ComponentFixture<CombinedBulletColumnLineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CombinedBulletColumnLineChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CombinedBulletColumnLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
