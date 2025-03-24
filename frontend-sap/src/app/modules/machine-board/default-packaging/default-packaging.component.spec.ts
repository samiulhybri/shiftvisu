import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultPackagingComponent } from './default-packaging.component';

describe('DefaultPackagingComponent', () => {
  let component: DefaultPackagingComponent;
  let fixture: ComponentFixture<DefaultPackagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DefaultPackagingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefaultPackagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
