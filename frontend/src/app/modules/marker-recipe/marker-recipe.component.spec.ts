import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerRecipeComponent } from './marker-recipe.component';

describe('MarkerRecipeComponent', () => {
	let component: MarkerRecipeComponent;
	let fixture: ComponentFixture<MarkerRecipeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MarkerRecipeComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(MarkerRecipeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
