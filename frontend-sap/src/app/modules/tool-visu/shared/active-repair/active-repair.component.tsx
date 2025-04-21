import { Button, FlexBox, Icon, ObjectStatus } from "@ui5/webcomponents-react";
import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { CustomReactGridTable, GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import React from "react";
import {
	ToolRepairStatus,
	ToolRepairStatusClass,
} from "@app/modules/tool-visu/enums/ToolRepairStatus";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Item } from "@app/shared/models/item.model";
import OperationPlan from "@app/shared/models/operation-plan.model";
import { User } from "@app/shared/models/user.model";
import Toast from '@ui5/webcomponents/dist/Toast';
import { Localization } from "@app/shared/utils/common-localize";
import { AuthService } from "@app/shared/services/auth.service";
import { Suppliers } from "@app/shared/models/suppliers.model";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";

@Component({
	selector: "app-active-repair",
	templateUrl: "./active-repair.component.html",
	styleUrl: "./active-repair.component.css",
})
export class ActiveRepairComponent {
	@Input() public isActiveRepairsDialogOpen: boolean = false;
	@Input() public isRepairHistoryComponentShow: boolean = false;
	@Input() public isShowFilterButton: boolean = false;
	@Input() public hasActionEditButton: boolean = true;
	@Input() public activeRepairs: any[] = [];
	public userList?: any;
	public supplierList?: any;
	@Input() public set allUserList(userList: User[] | undefined) {
		this.userList = userList ? userList : [];
	};
	@Input() public set allSupplierList(supplierList: Suppliers[] | undefined) {
		this.supplierList = supplierList ? supplierList : [];
	};
	public repairTypeList?: any;
	@Input() public set allRepairTypeList(repairTypeList: OperationPlan[] | undefined) {
		this.repairTypeList = repairTypeList ? repairTypeList : [];
	};
	public itemForRepairFilter: any;
	@Input() public set selectedTool(dataItem: Item) {
		this.itemForRepairFilter = dataItem ? dataItem : undefined;
	}
	@Output() public closeActiveRepairsDialog: EventEmitter<any> = new EventEmitter();
	@Output() public afterSaveDetails: EventEmitter<any> = new EventEmitter();
	@Output() public afterTabChange: EventEmitter<any> = new EventEmitter();
	@Output() public filterRepairs: EventEmitter<any> = new EventEmitter();
	@ViewChild("childComponentForActiveRef", { static: false }) childComponent: CustomReactGridTable | undefined;
	@ViewChild("childComponentForActiveToolOverviewRef", { static: false }) childComponentForActiveToolOverviewRef: CustomReactGridTable | undefined;

	private authUser!: User;
	private hasAuth: boolean = true;
	localization = Localization;
	public dialogTitle = $localize`Active Repair`;
	public gridHeader = $localize`Active Repair List`;
	public preparedData: any[] = [];
	public selectedActiveRepair = new ProdOrderPos().deserialize({});
	public isPreviewDialogOpen: boolean = false;
	public filePreviewHeight = 629;
	public previewDialogTitle = $localize`Attachment`;
	public isLoading: boolean = false;
	public fileCount: number = 0;
	public selectedTab = 'active_order_tab'
	public detailsModalType = '';
	public isViewDialogOpen = false;
	public itemId?: number;
	public toastMessage: string = "";
	public isShowToaster: boolean = false;
	public isSaveProdOrderPos: boolean = false;
	public segmentButtonItems = [
		{ id: '1', name: $localize`Active Orders` },
		{ id: '2', name: $localize`Completed Orders` }
	];

	columns: any = [
		{
			Header: $localize`Auto Repair`,
			accessor: "is_automatic_created_repair",
			hAlign: "Center",
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			maxWidth: 150,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const operations = rowData.prodOrderPosOperations;
				let isAutoRepairFound: boolean = operations ? operations.find((elm: ProdOrderPosOperation) => elm.is_automatic_created_repair == true) : false;

				return (
					<React.StrictMode>
						<FlexBox>
							<Icon name={isAutoRepairFound ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Order No.`,
			accessor: "prodOrder.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Left",
			maxWidth: 150
		},
		{
			Header: $localize`Person`,
			accessor: "userCreator.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Left",
			minWidth: 150,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				if (rowData.userCreator) {
					return (
						<>
							{rowData.userCreator.name}
						</>
					);
				} else return null;
			},
		},
		{
			Header: $localize`Responsible`,
			accessor: "userResponsible.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Left",
			minWidth: 150,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				if (rowData.userResponsible) {
					return (
						<>
							{rowData.userResponsible.name}
						</>
					);
				} else return null;
			},
		},
		{
			Header: $localize`Status`,
			accessor: "price",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedArray,
			hAlign: "Left",
			maxWidth: 230,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				if (rowData.is_production_possible) {
					return (
						<React.StrictMode>
							<FlexBox>
								<ObjectStatus
									showDefaultIcon
									state={ValueState.Positive}
									style={{
										width: "200px",
										height: "18px",
										backgroundColor: "var(--production-lite-color)",
										color: "var(--status-true-text-color)",
										border: "var(--status-border-color)",
										padding: "5px 8px 5px 8px",
										borderRadius: "8px",
										fontWeight: 700,
									}}>
									{ToolRepairStatusClass.getStateTranslate(
										ToolRepairStatus.POSSIBLE
									)}
								</ObjectStatus>
							</FlexBox>
						</React.StrictMode>
					);
				} else {
					return (
						<React.StrictMode>
							<FlexBox>
								<ObjectStatus
									showDefaultIcon
									state={ValueState.Negative}
									style={{
										width: "200px",
										height: "18px",
										backgroundColor: "var(--standstill-lite-color)",
										color: "var(--statnstill-color-compact-hover)",
										border: "var(--bom-status-error-border-color)",
										padding: "5px 8px 5px 8px",
										borderRadius: "8px",
										fontWeight: 700,
									}}>
									{ToolRepairStatusClass.getStateTranslate(
										ToolRepairStatus.NOT_POSSIBLE
									)}
								</ObjectStatus>
							</FlexBox>
						</React.StrictMode>
					);
				}
			},
		},
		{
			Header: $localize`Actual Time`,
			accessor: "actual_time",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Left",
			minWidth: 150
		},
		{
			Header: $localize`Cost`,
			accessor: "cost",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Left",
			dataType: GridTableColumnDataType.Number,
			minWidth: 100
		},
		{
			Header: $localize`Attachment`,
			accessor: "id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Left",
			maxWidth: 120,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalAttachments: any[] = [];
				rowData.media.map((item: any) => {
					totalAttachments.push(item.id);
				});
				this.fileCount = totalAttachments.length;

				if (totalAttachments.length > 0) {
					return (
						<Button
							icon="attachment"
							onClick={() => this.showPreview(rowData, totalAttachments.length)}>
							{totalAttachments.length > 1 ? totalAttachments.length + ' ' + $localize`Files` : totalAttachments.length + ' ' + $localize`File`}
						</Button>
					);
				} else return null;
			},
		},
		{
			Header: $localize`Date`,
			accessor: "created_at",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.String,
			hAlign: "Right",
			maxWidth: 100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const date = new Date(rowData.created_at);

				// Get day, month, and year from the Date object
				const day = String(date.getDate()).padStart(2, "0");
				const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
				const year = date.getFullYear();

				// Format the date as dd.mm.yyyy
				return (
					<>
						{`${day}.${month}.${year}`}
					</>
				);
			},
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Center",
			maxWidth: 100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;


				if (this.hasActionEditButton && this.hasAuth) {
					return (
						<React.StrictMode>
							<FlexBox>
								<Button
									icon="edit"
									design="Transparent"
									onClick={() => this.openViewModal(rowData, 'edit')}>
								</Button>
							</FlexBox>
						</React.StrictMode>
					);
				} else {
					return (
						<React.StrictMode>
							<FlexBox>
								<Button
									icon="show"
									design="Transparent"
									onClick={() => this.openViewModal(rowData, 'view')}>
								</Button>
							</FlexBox>
						</React.StrictMode>
					);
				}
			},
		},
	];

	constructor(private _commonSrv: CommonService,
		private _authSrv: AuthService,
		protected _toastSrv: ToastService,
	) { }

	ngOnInit() {
		this.authUser = this._authSrv.getUser();
		const checkAuth = this.authUser.roleString?.includes('SUPERADMIN') ||
			this.authUser.roleString?.includes('ADMIN_TOOLVISU') ||
			this._authSrv.isPermissionValid(PermissionEnum.TOOLVISU_TOOL_REPAIR_EDIT) ||
			this._authSrv.isPermissionValid(PermissionEnum.TOOLVISU_PLANNED_ORDERS_EDIT);
		if (checkAuth) this.hasAuth = true;
		else this.hasAuth = false;

		this.preparedData = [];
		this.gridHeader = $localize`Active Repair List`;
		if (this.isShowFilterButton) this.dialogTitle = $localize`Tool Orders`;
		if (this.childComponent) this.childComponent.isBusy = true;

		if (!this.isRepairHistoryComponentShow) {
			this.columns.splice(5, 2)
		}
	}

	ngOnChanges(changes: any) {
		if (changes.isActiveRepairsDialogOpen) this.isActiveRepairsDialogOpen = changes.isActiveRepairsDialogOpen.currentValue;
	}

	prepareDataForStatus(dataItem: any) {
		try {
			this.preparedData = dataItem?.map((prod: ProdOrderPos) => {
				prod.status = prod.is_production_possible ? ValueState.Positive : ValueState.Negative;
				return prod;
			});

			this.isLoading = false;
			if (this.childComponent) {
				this.childComponent.isBusy = false;
				this.childComponent.render();
			}
		} catch (error) {
			console.log(error);
		}
	}

	closeDialog() {
		this.isShowToaster = false;
		this.isSaveProdOrderPos = false;
		this.closeActiveRepairsDialog.emit();
		this.selectedTab = "active_order_tab";
	}

	openViewModal(data: ProdOrderPos, detailsModalType: string) {
		this.detailsModalType = detailsModalType == 'edit' ? 'edit' : 'view'
		this.itemId = data.id;
		this.isViewDialogOpen = true;
	}

	closeViewDialog() {
		this.isShowToaster = false;
		this.isSaveProdOrderPos = false;
		this.isViewDialogOpen = false;
	}

	isSavedModal() {
		this.isSaveProdOrderPos = true;
		this.afterSaveDetails.emit();
	}

	showPreview(repair: any, count: number) {
		this.selectedActiveRepair = new ProdOrderPos().deserialize(repair);
		this.fileCount = count;
		this.isPreviewDialogOpen = true;
	}

	closeAttachmentDialog() {
		this.isPreviewDialogOpen = false;
	}

	segmentButtonChange(event: any) {
		if (this.isShowFilterButton) {
			let button = event.detail.selectedItems[0].id;
			this.filterRepairs.emit(button);
		}
	}
	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
		if (this.selectedTab == 'active_order_tab') {
			this.isLoading = true;
			this.afterTabChange.emit()
		}
	}

	isShowMessage(event: any) {
		this.isShowToaster = true;
		this.toastMessage = event.message;
	}

	showModalToast() {
		const toast = document.getElementById("modalToast") as Toast;
		toast.setAttribute("z-index", "10000000");
		toast.setAttribute("display", "block");
		(toast as Toast).open = true;
	}
}