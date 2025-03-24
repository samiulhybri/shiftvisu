import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtNormsComponent } from './mt-norms.component';

describe('MtNormsComponent', () => {
  let component: MtNormsComponent;
  let fixture: ComponentFixture<MtNormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtNormsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtNormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
