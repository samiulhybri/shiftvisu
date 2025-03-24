import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtNormsDetailsComponent } from './mt-norms-details.component';

describe('MtNormsDetailsComponent', () => {
  let component: MtNormsDetailsComponent;
  let fixture: ComponentFixture<MtNormsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtNormsDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtNormsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
