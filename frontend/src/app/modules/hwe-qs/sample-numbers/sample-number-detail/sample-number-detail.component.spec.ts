import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleNumberDetailComponent } from './sample-number-detail.component';

describe('SampleNumberDetailComponent', () => {
  let component: SampleNumberDetailComponent;
  let fixture: ComponentFixture<SampleNumberDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SampleNumberDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleNumberDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
