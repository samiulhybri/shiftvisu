import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HweKalkComponent } from './hwe-kalk.component';

describe('HweKalkComponent', () => {
  let component: HweKalkComponent;
  let fixture: ComponentFixture<HweKalkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HweKalkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HweKalkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
