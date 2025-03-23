import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsNormsComponent } from './us-norms.component';

describe('UsNormsComponent', () => {
  let component: UsNormsComponent;
  let fixture: ComponentFixture<UsNormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsNormsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsNormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
