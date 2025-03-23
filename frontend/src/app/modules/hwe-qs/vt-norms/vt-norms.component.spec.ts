import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VtNormsComponent } from './vt-norms.component';

describe('VtNormsComponent', () => {
  let component: VtNormsComponent;
  let fixture: ComponentFixture<VtNormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VtNormsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VtNormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
