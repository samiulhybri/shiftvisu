import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonDestructiveTestingDetailsComponent } from './non-destructive-testing-details.component';

describe('NonDestructiveTestingDetailsComponent', () => {
  let component: NonDestructiveTestingDetailsComponent;
  let fixture: ComponentFixture<NonDestructiveTestingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonDestructiveTestingDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonDestructiveTestingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
