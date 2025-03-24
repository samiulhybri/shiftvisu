import { TestBed } from '@angular/core/testing';

import { MarkerRecipeService } from './marker-recipe.service';

describe('MarkerRecipeService', () => {
	let service: MarkerRecipeService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(MarkerRecipeService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
