import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationGroupComponent } from './notification-group.component';

describe('NotificationGroupComponent', () => {
  let component: NotificationGroupComponent;
  let fixture: ComponentFixture<NotificationGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
