import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerPosComponent } from './marker-pos.component';

describe('MarkerPosComponent', () => {
	let component: MarkerPosComponent;
	let fixture: ComponentFixture<MarkerPosComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MarkerPosComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(MarkerPosComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
