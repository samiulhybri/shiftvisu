import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallCapacitySettingsComponent } from './hall-capacity-settings.component';

describe('HallCapacitySettingsComponent', () => {
  let component: HallCapacitySettingsComponent;
  let fixture: ComponentFixture<HallCapacitySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HallCapacitySettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HallCapacitySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
