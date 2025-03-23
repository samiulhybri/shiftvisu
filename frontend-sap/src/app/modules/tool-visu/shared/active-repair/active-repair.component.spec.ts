import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActiveRepairComponent } from "@app/modules/tool-visu/shared/active-repair/active-repair.component";

describe("ActiveRepairComponent", () => {
	let component: ActiveRepairComponent;
	let fixture: ComponentFixture<ActiveRepairComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ActiveRepairComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ActiveRepairComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
