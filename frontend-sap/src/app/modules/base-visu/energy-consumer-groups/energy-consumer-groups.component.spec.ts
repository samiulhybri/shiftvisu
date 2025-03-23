import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyConsumerGroupsComponent } from './energy-consumer-groups.component';

describe('EnergyConsumerGroupsComponent', () => {
  let component: EnergyConsumerGroupsComponent;
  let fixture: ComponentFixture<EnergyConsumerGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnergyConsumerGroupsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnergyConsumerGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
