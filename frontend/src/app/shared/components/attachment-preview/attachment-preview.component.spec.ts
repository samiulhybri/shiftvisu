import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentPreviewComponent } from './attachment-preview.component';

describe('AttachmentPreviewComponent', () => {
  let component: AttachmentPreviewComponent;
  let fixture: ComponentFixture<AttachmentPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachmentPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachmentPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
