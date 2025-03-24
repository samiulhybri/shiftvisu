import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyNewRequestComponent } from './my-new-request.component';

describe('MyNewRequestComponent', () => {
  let component: MyNewRequestComponent;
  let fixture: ComponentFixture<MyNewRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyNewRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyNewRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
