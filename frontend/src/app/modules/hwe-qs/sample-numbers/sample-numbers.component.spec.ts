import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleNumbersComponent } from './sample-numbers.component';

describe('ProbennummernComponent', () => {
  let component: SampleNumbersComponent;
  let fixture: ComponentFixture<SampleNumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SampleNumbersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
