import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingScopesComponent } from './testing-scopes.component';

describe('TestingScopesComponent', () => {
  let component: TestingScopesComponent;
  let fixture: ComponentFixture<TestingScopesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestingScopesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingScopesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
