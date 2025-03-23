import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeltVisuComponent } from './melt-visu.component';

describe('MeltVisuComponent', () => {
  let component: MeltVisuComponent;
  let fixture: ComponentFixture<MeltVisuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeltVisuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeltVisuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
