import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidualMaterialDetailsComponent } from './residual-material-details.component';

describe('ResidualMaterialDetailsComponent', () => {
  let component: ResidualMaterialDetailsComponent;
  let fixture: ComponentFixture<ResidualMaterialDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResidualMaterialDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidualMaterialDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
