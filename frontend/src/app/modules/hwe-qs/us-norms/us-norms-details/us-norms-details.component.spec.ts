import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsNormsDetailsComponent } from './us-norms-details.component';

describe('UsNormsDetailsComponent', () => {
  let component: UsNormsDetailsComponent;
  let fixture: ComponentFixture<UsNormsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsNormsDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsNormsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
