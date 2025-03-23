import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialNormsComponent } from './material-norms.component';

describe('MaterialNormsComponent', () => {
  let component: MaterialNormsComponent;
  let fixture: ComponentFixture<MaterialNormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialNormsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialNormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
