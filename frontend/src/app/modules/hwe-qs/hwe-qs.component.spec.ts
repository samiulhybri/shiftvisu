import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HweQsComponent } from './hwe-qs.component';

describe('HweQsComponent', () => {
  let component: HweQsComponent;
  let fixture: ComponentFixture<HweQsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HweQsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HweQsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
