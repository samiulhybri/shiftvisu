import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { Localization } from "@app/shared/utils/common-localize";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";
import {ProdInspectionOperation} from "@app/shared/models/prod-inspection-operation.model";

@Component({
	selector: "app-quali-visu-machineboard",
	templateUrl: "./quali-visu-machineboard.component.html",
	styleUrl: "./quali-visu-machineboard.component.css",
})
export class QualiVisuMachineboardComponent implements OnInit, OnDestroy {
	baseTitle: string = $localize`QualiVisu`;
	localization = Localization;
	isDialogOpen = true;
	operationIds: number[] = [];
	isUserBlocked: boolean = false;
	noOpenPointsAvailable: boolean = false;
    selectedInspectionOperation: ProdInspectionOperation | undefined;

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private machineboardService: MachineboardService,
	) {}

	ngOnInit(): void {

		this.machineboardService.operationsBehaviorObservable().subscribe(response => {
			this.operationIds = response.map(o => o.id);
		});

		this.machineboardService.isUserBlockedForInspectionPoint$.subscribe({
			next : (res) => {
				this.isUserBlocked = res;
			},
			error: (e) => {

			},
			complete: () => {}
		});

		document.addEventListener('keydown', this.onKeyDown.bind(this));
	}

	ngOnDestroy() {
		document.removeEventListener('keydown', this.onKeyDown.bind(this));
	}

	onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && this.isUserBlocked) {
			event.preventDefault();
			event.stopPropagation();
        	event.stopImmediatePropagation();
		}
	}

	closeDialog(event: any) {
		if(this.isUserBlocked) {
			event?.preventDefault();
			return;
		}
		this.isDialogOpen = false;
		this.router.navigate(["../"], { relativeTo: this.activatedRoute });
	}

    setSelectedInspectionOperation(operation: ProdInspectionOperation | undefined) {
        this.selectedInspectionOperation = operation;
    }
}
