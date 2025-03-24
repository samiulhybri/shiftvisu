import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidualMaterialsComponent } from './residual-materials.component';

describe('ResidualMaterialsComponent', () => {
  let component: ResidualMaterialsComponent;
  let fixture: ComponentFixture<ResidualMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResidualMaterialsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidualMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
