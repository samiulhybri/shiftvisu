import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagingItemImageComponent } from './packaging-item-image.component';

describe('PackagingItemImageComponent', () => {
  let component: PackagingItemImageComponent;
  let fixture: ComponentFixture<PackagingItemImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackagingItemImageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PackagingItemImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
