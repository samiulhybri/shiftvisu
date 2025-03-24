import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificatesDetailsComponent } from './certificates-details.component';

describe('CertificatesDetailsComponent', () => {
  let component: CertificatesDetailsComponent;
  let fixture: ComponentFixture<CertificatesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificatesDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificatesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
