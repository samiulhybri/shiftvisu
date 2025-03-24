import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintHandlingUnitComponent } from './print-handling-unit.component';

describe('PrintHandlingUnitComponent', () => {
  let component: PrintHandlingUnitComponent;
  let fixture: ComponentFixture<PrintHandlingUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrintHandlingUnitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrintHandlingUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
