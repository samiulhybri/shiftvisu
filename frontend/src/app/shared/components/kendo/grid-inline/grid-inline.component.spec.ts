import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridInlineComponent } from './grid-inline.component';

describe('GridInlineComponent', () => {
  let component: GridInlineComponent;
  let fixture: ComponentFixture<GridInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
