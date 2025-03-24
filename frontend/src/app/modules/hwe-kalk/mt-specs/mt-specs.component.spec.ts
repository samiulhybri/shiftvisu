import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtSpecsComponent } from './mt-specs.component';

describe('MtSpecsComponent', () => {
  let component: MtSpecsComponent;
  let fixture: ComponentFixture<MtSpecsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtSpecsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtSpecsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
