import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { InspectionOperationTabType } from "@app/shared/enums/inspection-operation-tab-type";
import { AuthService } from "@app/shared/services/auth.service";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";
import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";
import { InspectionOperationFilterEnum } from "@app/modules/quali-visu/enums/inspection-operation-filter-enum";
import { InspectionPointTabComponent } from "@app/modules/quali-visu/inspection-point-list/inspection-point-tab/inspection-point-tab.component";

@Component({
	selector: "app-inspection-point-list",
	templateUrl: "./inspection-point-list.component.html",
	styleUrl: "./inspection-point-list.component.css",
})
export class InspectionPointListComponent implements OnChanges {
	@ViewChild("inspectionPointTab") inspectionPointTab?: InspectionPointTabComponent;
	@Input() operationIds: number[] = [];

	@Output() onSelectedInspectionOperationChange: EventEmitter<any> = new EventEmitter<any>();

	allInspectionOperation: any[] = [];

	inspectionOperationList: any[] = [];
	inspectionOperationFilterType: string = InspectionOperationFilterEnum.OPEN;

	isNavBarLoading = true;

	selectedTab?: InspectionOperationTabType = this.firstValidTab;

	selectedInspectionOperation: any = null;

	isUserBlocked: boolean = false;

	tabPermissionList: {type: InspectionOperationTabType, permission: PermissionEnum[]}[] = [
		{
			type: InspectionOperationTabType.INSPECTION_POINT,
			permission: [PermissionEnum.QUALIVISU_INSPECTION_POINT_VIEW, PermissionEnum.MACHINEBOARD_QUALIVISU_EDIT, PermissionEnum.MACHINEBOARD_QUALIVISU_EDIT_IF_QUALIFIED]
		},
		{
			type: InspectionOperationTabType.ATTACHMENT,
			permission: []
		},
	];

	get inspectionOperationTabType() {
		return InspectionOperationTabType;
	}

	get inspectionOperationFilterEnum() {
		return InspectionOperationFilterEnum;
	}

	get permissionEnums() {
		return PermissionEnum;
	}

	get firstValidTab () {
		return this.tabPermissionList?.find(tab => tab.permission.some(p => this.authService.isPermissionValid(p)))?.type;
	}

	constructor(
		private qualiVisuService: QualiVisuService,
		public authService: AuthService,
		private route: ActivatedRoute,
		private machineboardService: MachineboardService,
	) {}

	ngOnInit(): void {
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

	ngOnChanges(changes: SimpleChanges): void {
		if (
			changes["operationIds"]?.currentValue?.length &&
			changes["operationIds"].currentValue != changes["operationIds"].previousValue
		) {
			this.updateInspectionOperationList();
		}
	}

	updateInspectionOperationList() {
		let selectedInspectionId = this.selectedInspectionOperation?.id ?? null;

		this.onSelectedInspectionOperationChange.emit(this.selectedInspectionOperation?.name ?? "");
		this.isNavBarLoading = true;
		let payload = {
			prod_order_pos_operation_ids: this.operationIds,
		};

		this.qualiVisuService
			.post(`quali-visu/get-inspections-by-operations`, payload, false)
			.subscribe({
				next: (response: any) => {
					this.inspectionOperationList = [];
					this.allInspectionOperation = response.inspection_operations;

					if (this.inspectionOperationFilterType == InspectionOperationFilterEnum.OPEN) {
						this.inspectionOperationList = [
							...this.allInspectionOperation.filter(iO => iO.is_open),
						];
					} else if (
						this.inspectionOperationFilterType == InspectionOperationFilterEnum.ALL
					) {
						this.inspectionOperationList = [...this.allInspectionOperation];
					} else if (
						this.inspectionOperationFilterType == InspectionOperationFilterEnum.CLOSED
					) {
						this.inspectionOperationList = [
							...this.allInspectionOperation.filter(iO => !iO.is_open),
						];
					}

					if(this.inspectionOperationList.length == 0)
						this.selectedInspectionOperation = null;
					this.selectedTab = this.firstValidTab;

					if (this.inspectionOperationList.length) {
						let newSelectedInspectionOperation =
							this.inspectionOperationList.find(
								iO => iO.id == selectedInspectionId
							) ?? null;
						this.selectedInspectionOperation =
							newSelectedInspectionOperation ?? this.inspectionOperationList[0];
					}

					this.onSelectedInspectionOperationChange.emit(
						this.selectedInspectionOperation?.name ?? ""
					);

					this.isNavBarLoading = false;
				},

				error: (error: any) => {
					this.isNavBarLoading = false;
				},
			});
	}

	selectInspectionOperation(inspectionOption: any) {
		this.selectedTab = this.firstValidTab;
		this.selectedInspectionOperation = inspectionOption;
		this.onSelectedInspectionOperationChange.emit(this.selectedInspectionOperation?.name ?? "");
	}

	selectTab(event: any) {
		this.selectedTab = event.detail.tab.id;
	}

	updateInspectionOperationFilterType(event: any) {
		this.inspectionOperationFilterType = event.detail.selectedItems[0].id;

		if (this.inspectionOperationFilterType == InspectionOperationFilterEnum.ALL) {
			this.inspectionOperationList = [...this.allInspectionOperation];
		} else if (this.inspectionOperationFilterType == InspectionOperationFilterEnum.OPEN) {
			this.inspectionOperationList = [
				...this.allInspectionOperation.filter(iO => iO.is_open),
			];
		} else if (this.inspectionOperationFilterType == InspectionOperationFilterEnum.CLOSED) {
			this.inspectionOperationList = [
				...this.allInspectionOperation.filter(iO => !iO.is_open),
			];
		}

		if (this.inspectionOperationList.length) {
			this.selectedInspectionOperation = this.inspectionOperationList[0];
		} else {
			this.selectedInspectionOperation = null;
		}

		this.selectedTab = this.firstValidTab;

		this.onSelectedInspectionOperationChange.emit(this.selectedInspectionOperation?.name ?? "");
	}
}
