import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtNormsComponent } from './pt-norms.component';

describe('PtNormsComponent', () => {
  let component: PtNormsComponent;
  let fixture: ComponentFixture<PtNormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtNormsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PtNormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
