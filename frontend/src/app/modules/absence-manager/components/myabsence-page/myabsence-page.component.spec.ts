import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyabsencePageComponent } from './myabsence-page.component';

describe('MyabsencePageComponent', () => {
  let component: MyabsencePageComponent;
  let fixture: ComponentFixture<MyabsencePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyabsencePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyabsencePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
