import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceManagerComponent } from './absence-manager.component';

describe('AbsenceManagerComponent', () => {
  let component: AbsenceManagerComponent;
  let fixture: ComponentFixture<AbsenceManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbsenceManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsenceManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
