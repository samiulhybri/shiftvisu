import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtSpecDetailsComponent } from './mt-spec-details.component';

describe('MtSpecDetailsComponent', () => {
  let component: MtSpecDetailsComponent;
  let fixture: ComponentFixture<MtSpecDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtSpecDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtSpecDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
