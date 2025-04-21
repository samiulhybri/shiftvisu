import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { UserGroup } from "@app/shared/models/user-group.model";
import { User } from "@app/shared/models/user.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { formatDate } from "@app/shared/utils/date-time-formatter";
import { Button, FlexBox, Text } from "@ui5/webcomponents-react";
import React from "react";
import { ProdInspectionOperationFrequencyClass } from "@app/modules/quali-visu/enums/prod-inspection-operation-frequency-enum";

@Component({
	selector: "app-inspection-point",
	templateUrl: "./inspection-point.component.html",
	styleUrl: "./inspection-point.component.css",
})
export class InspectionPointComponent {
	localization = Localization;
	inspectionPointCustomUrl = "";
	globalSearchValue = "";
	selectedMode = "open";
	page = 1;
	perPage = 50;
	userGroupFilterItems = {
		textAccessor: "name",
		idAccessor: "id",
		data: [],
	};

	segmentButtonItems = [
		{
			id: "all",
			name: $localize`All`,
		},
		{
			id: "open",
			name: $localize`Open`,
			defaultSelect: true,
		},
	];

	selectedUserGroup: number[] = [];
	selectedItem: number[] = [];
	selectedMachine: number[] = [];
	loggedInUser: User | undefined;

	@ViewChild("childComponentRef") gridTable?: CustomReactGridTable;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	ngOnInit() {
		this.inspectionPointCustomUrl = this.getUpdatedURL();

		this.loadData();
	}

	navigateToMachineBoard(data: any) {
		const machineId = data?.inspectable?.prod_order_pos_operation?.machine?.id;

		this.router.navigate([`machine-board/${machineId}`]);
	}

	columns: any = [
		{
			Header: $localize`Machine`,
			accessor: "inspectable.prod_order_pos_operation.machine.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			minWidth: 50,
			width: 300,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const operation = row.original?.inspectable?.prod_order_pos_operation;

				if (operation) {
					return (
						<React.StrictMode>
							<FlexBox
								id="nestedValueColumn"
								style={{
									//class is not working
									display: "flex",
									justifyContent: "space-between",
									width: "100%",
								}}>
								<Text>{operation?.machine?.name || ""}</Text>
								<Text>{operation?.machine?.custom_id || ""}</Text>
							</FlexBox>
						</React.StrictMode>
					);
				} else return <></>;
			},
		},
		{
			Header: $localize`Item`,
			accessor: "inspectable.prod_order_pos_operation.prodOrderPos.item.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			minWidth: 50,
			width: 480,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const operation = row.original?.inspectable?.prod_order_pos_operation;

				if (operation) {
					return (
						<React.StrictMode>
							<FlexBox
								id="nestedValueColumn"
								style={{
									//class is not working
									display: "flex",
									justifyContent: "space-between",
									width: "100%",
								}}>
								<Text>{operation?.prodOrderPos.item.name || ""}</Text>
								<Text>{operation?.prodOrderPos.item.custom_id || ""}</Text>
							</FlexBox>
						</React.StrictMode>
					);
				} else return <></>;
			},
		},
		{
			Header: $localize`Order`,
			accessor: "inspectable.prod_order_pos_operation.prodOrderPos.prodOrder.custom_id",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
		},
		{
			Header: $localize`Operation`,
			accessor: "inspectable.pos",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original?.inspectable;

				if(rowData){
					return (
						<React.StrictMode>
							<FlexBox>{rowData.pos} - {ProdInspectionOperationFrequencyClass.getTypeTranslateShortCode(rowData.frequency)} - {rowData.name}</FlexBox>
						</React.StrictMode>
					);
				} else return ''
			},
		},
		{
			Header: $localize`Completed`,
			accessor: "is_complete",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Boolean,
			autoResizable: true,
			hAlign: "Center",
		},
		{
			Header: $localize`Registered Date`,
			accessor: "registered_datetime",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Date,
			hAlign: "End",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const registeredDatetime = formatDate(rowData.registered_datetime, false);

				return (
					<React.StrictMode>
						<FlexBox>{registeredDatetime}</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`User Groups`,
			accessor: "inspection_lot_id", // Placeholder
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				const uniqueUserGroupsString = Array.from(
					new Set(
						rowData?.inspectionPointCharacteristics
							?.map(
								(ipc: any) =>
									ipc?.inspection_operation_characteristic?.user_group?.custom_id
							)
							.filter(Boolean)
					)
				).join(", ");

				return (
					<React.StrictMode>
						<FlexBox>{uniqueUserGroupsString}</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			minWidth: 100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox className="gap-3">
							<FlexBox>
								<Button
									design="Transparent"
									icon="bbyd-dashboard"
									tooltip={$localize`Navigate to Machine Board`}
									onClick={() => this.navigateToMachineBoard(rowData)}></Button>
							</FlexBox>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];

	loadData() {
		this.commonService.get("UserGroups?$filter=is_active eq true").subscribe({
			next: (response: any) => {
				this.userGroupFilterItems.data = response.value.map((item: any) => {
					return {
						id: item.id,
						name: item.custom_id,
						key: item.custom_id,
					};
				});
				this.gridTable?.render();
			},
		});
	}

	getUpdatedURL() {
		this.loggedInUser = this.authService.getUser();

		return `/quali-visu/${this.loggedInUser?.id}/open-inspection-points?search=${this.globalSearchValue}&isAll=${this.selectedMode == "all" ? 1 : 0}&userGroupId=${this.selectedUserGroup.toString()}&itemId=${this.selectedItem.toString()}&machineId=${this.selectedMachine.toString()}&page=${this.page}&perPage=${this.perPage}`;
	}

	onLoadMoreForForklift() {
		this.page += 1;

		this.inspectionPointCustomUrl = this.getUpdatedURL();

		if (this.gridTable) {
			this.gridTable.customUrl = this.inspectionPointCustomUrl;

			this.gridTable.onPagination();
		}
	}

	processData(data1: any, data2: any) {}

	multiSelectOneSelectionChange(event: any) {
		this.selectedUserGroup = event.detail.items.map((item: any) => Number(item.id));
		this.gridTable!.skip = 0;
		this.page = 1;

		this.inspectionPointCustomUrl = this.getUpdatedURL();

		if (this.gridTable) {
			this.gridTable.customUrl = this.inspectionPointCustomUrl;
			this.gridTable.onPagination(true);
		}
	}

	onLoadMoreForCustomAPI() {
		this.page += 1;

		this.inspectionPointCustomUrl = this.getUpdatedURL();

		if (this.gridTable) {
			this.gridTable.customUrl = this.inspectionPointCustomUrl;

			this.gridTable.onPagination();
		}
	}

	onSearchForCustomAPI(searchValue: string) {
		this.globalSearchValue = searchValue;

		this.page = 1;

		this.inspectionPointCustomUrl = this.getUpdatedURL();

		if (this.gridTable) {
			this.gridTable.customUrl = this.inspectionPointCustomUrl;

			this.gridTable.onPagination(true);
		}
	}

	segmentButtonChange(event: any) {
		this.selectedMode = event.detail.selectedItems[0].id;
		this.page = 1;

		this.inspectionPointCustomUrl = this.getUpdatedURL();

		if (this.gridTable) {
			this.gridTable.customUrl = this.inspectionPointCustomUrl;
			this.gridTable.onPagination(true);
		}
	}
}
