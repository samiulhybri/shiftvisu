import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { Localization } from "@app/shared/utils/common-localize";
import { AuthService } from "@app/shared/services/auth.service";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { ToastService } from "@app/shared/services/toaster.service";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";

import { InspectionOperationFilterEnum } from "@app/modules/quali-visu/enums/inspection-operation-filter-enum";

@Component({
	selector: "app-quali-visu-machineboard",
	templateUrl: "./quali-visu-machineboard.component.html",
	styleUrl: "./quali-visu-machineboard.component.css",
})
export class QualiVisuMachineboardComponent implements OnInit, OnDestroy {
	baseTitle: string = $localize`QualiVisu`;
	qualiVisuPage: string = this.baseTitle;
	localization = Localization;
	isDialogOpen = true;
	operationIds: number[] = [];
	isUserBlocked: boolean = false;

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private authService: AuthService,
		private machineboardService: MachineboardService,
		private toastService: ToastService
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
		})
		
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

	updateTitle(title: any) {
		if (title) {
			this.qualiVisuPage = this.baseTitle + " - " + title;
		} else {
			this.qualiVisuPage = this.baseTitle;
		}
	}
}
