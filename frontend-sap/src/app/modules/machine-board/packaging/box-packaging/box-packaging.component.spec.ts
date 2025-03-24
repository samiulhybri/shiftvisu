import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxPackagingComponent } from './box-packaging.component';

describe('BoxPackagingComponent', () => {
  let component: BoxPackagingComponent;
  let fixture: ComponentFixture<BoxPackagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoxPackagingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoxPackagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
