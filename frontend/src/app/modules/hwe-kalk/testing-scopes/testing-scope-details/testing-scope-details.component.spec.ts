import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingScopeDetailsComponent } from './testing-scope-details.component';

describe('TestingScopeDetailsComponent', () => {
  let component: TestingScopeDetailsComponent;
  let fixture: ComponentFixture<TestingScopeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestingScopeDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingScopeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
