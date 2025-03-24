import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialDatabaseDetailsComponent } from './material-database-details.component';

describe('MaterialDatabaseDetailsComponent', () => {
  let component: MaterialDatabaseDetailsComponent;
  let fixture: ComponentFixture<MaterialDatabaseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialDatabaseDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialDatabaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
