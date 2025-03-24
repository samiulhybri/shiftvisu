import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialDatabaseComponent } from './material-database.component';

describe('MaterialDatabaseComponent', () => {
  let component: MaterialDatabaseComponent;
  let fixture: ComponentFixture<MaterialDatabaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialDatabaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
