import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerIssuesViewComponent } from './server-issues-view.component';

describe('ServerIssuesViewComponent', () => {
  let component: ServerIssuesViewComponent;
  let fixture: ComponentFixture<ServerIssuesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServerIssuesViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServerIssuesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
