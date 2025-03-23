import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpOffersComponent } from './mp-offers.component';

describe('MpOffersComponent', () => {
	let component: MpOffersComponent;
	let fixture: ComponentFixture<MpOffersComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MpOffersComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(MpOffersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
