import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetallographiesComponent } from './metallographies.component';

describe('MetallographiesComponent', () => {
  let component: MetallographiesComponent;
  let fixture: ComponentFixture<MetallographiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetallographiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetallographiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
