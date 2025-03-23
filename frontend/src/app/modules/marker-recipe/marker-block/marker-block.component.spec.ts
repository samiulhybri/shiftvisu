import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerBlockComponent } from './marker-block.component';

describe('MarkerBlockComponent', () => {
	let component: MarkerBlockComponent;
	let fixture: ComponentFixture<MarkerBlockComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MarkerBlockComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(MarkerBlockComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
