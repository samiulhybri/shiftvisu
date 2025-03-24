import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonDestructiveTestingsComponent } from './non-destructive-testings.component';

describe('NonDestructiveTestingsComponent', () => {
  let component: NonDestructiveTestingsComponent;
  let fixture: ComponentFixture<NonDestructiveTestingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonDestructiveTestingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonDestructiveTestingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
