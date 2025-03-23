import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubDetailsHeaderComponent } from './sub-details-header.component';

describe('SubDetailsHeaderComponent', () => {
  let component: SubDetailsHeaderComponent;
  let fixture: ComponentFixture<SubDetailsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubDetailsHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubDetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
