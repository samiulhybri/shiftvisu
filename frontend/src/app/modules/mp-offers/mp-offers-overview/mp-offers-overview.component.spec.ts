import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpOffersOverviewComponent } from './mp-offers-overview.component';

describe('MpOffersOverviewComponent', () => {
	let component: MpOffersOverviewComponent;
	let fixture: ComponentFixture<MpOffersOverviewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MpOffersOverviewComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(MpOffersOverviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
