import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StaffNeededComponent } from "./staff-needed.component";

describe("StaffNeededComponent", () => {
	let component: StaffNeededComponent;
	let fixture: ComponentFixture<StaffNeededComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [StaffNeededComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(StaffNeededComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
