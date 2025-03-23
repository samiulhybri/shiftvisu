import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RootItemComponent } from './root-item.component';

describe('RootItemComponent', () => {
	let component: RootItemComponent;
	let fixture: ComponentFixture<RootItemComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [RootItemComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(RootItemComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
