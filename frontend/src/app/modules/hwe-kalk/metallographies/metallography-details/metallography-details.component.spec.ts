import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetallographyDetailsComponent } from './metallography-details.component';

describe('MetallographyDetailsComponent', () => {
  let component: MetallographyDetailsComponent;
  let fixture: ComponentFixture<MetallographyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetallographyDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetallographyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
