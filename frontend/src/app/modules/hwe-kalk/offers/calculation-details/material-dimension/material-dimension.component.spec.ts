import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialDimensionComponent } from './material-dimension.component';

describe('MaterialDimensionComponent', () => {
  let component: MaterialDimensionComponent;
  let fixture: ComponentFixture<MaterialDimensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialDimensionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialDimensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
