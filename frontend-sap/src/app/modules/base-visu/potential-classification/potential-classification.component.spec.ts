import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PotentialClassificationComponent } from './potential-classification.component';

describe('PotentialClassificationComponent', () => {
  let component: PotentialClassificationComponent;
  let fixture: ComponentFixture<PotentialClassificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PotentialClassificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PotentialClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
