import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Component, ViewChild, Output } from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Toast.js";
import { User } from "@app/shared/models/user.model";
import { NgForm } from "@angular/forms";
import { AuthService } from "@app/shared/services/auth.service";
import { CapacitiesComponent } from "@app/modules/base-visu/user-capacities/capacities/capacities.component";
import { Localization } from "@app/shared/utils/common-localize";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { Hall } from "@app/shared/models/hall.model";

@Component({
	selector: "app-user-capacities",
	templateUrl: "./user-capacities.component.html",
	styleUrl: "./user-capacities.component.css",
})
export class UserCapacitiesComponent {
	selectedRowValue: any;
	isLoading: boolean = false;
	user = User;
	customId: string = "";
	localization = Localization;
	@Output() selectedUser: User = new User().deserialize({});
	@ViewChild("create0rUpdateForm") form = NgForm;
	@ViewChild("capacitiesComponent") capacitiesComponent!: CapacitiesComponent;
	isLoadingCustomId: boolean = false;
	disableButtonDuringRequest: boolean = false;
	associateData: any = [];
	searchedValue: string = "";
	topValue: number = 1000;
	isDeselectEnable: boolean = false;
	globalSearchValue = "";	

	isCompactHeight: boolean = false;
	halls: Hall[] = [];
	users: User[] = [];
	userCapacity: any[] = [];

	//Capacities
	heightForCalender = 400;
	heightForMachineTree = 344;
	heightForCalenderEmptyData = 400;
	heightForRows = 30;

	columns = [
		{
			Header: $localize`Hall`,
			accessor: "hallName",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["hallName", "hallCustomId"],
			autoResizable: true,
		},
		{
			Header: $localize`User`,
			accessor: "userCustomId",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["userName", "userCustomId"],
			autoResizable: true,
		},
	];
	constructor(
		public commonService: CommonService,
		public authService: AuthService
	) {
		this.selectedUser = new User().deserialize({});
	}

	ngOnInit(): void {
		this.calculateHeightForCalenders();
		this.loadData();
		this.updateTableRowCount();
	}

	calculateHeightForCalenders() {
		const usableHeight = window.innerHeight - 74;
		this.isCompactHeight = usableHeight < 1000;

		this.heightForMachineTree = this.isCompactHeight
			? (35 / 100) * usableHeight
			: (35 / 100) * usableHeight;

		this.heightForCalender = this.isCompactHeight
			? (65 / 100) * usableHeight + 150
			: (65 / 100) * usableHeight;
		this.heightForCalenderEmptyData = this.heightForCalender - 35;
		this.heightForRows = this.heightForCalenderEmptyData / (this.isCompactHeight ? 18 : 14);
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	selectionChange(values: any) {
		this.selectedRowValue = values.detail.selectedFlatRows[0]?.original; // Single select
	}

	onGlobalSearch(e: any) {
		// Trim and convert the search value to lowercase
		this.globalSearchValue = e.target.typedInValue;
		const trimmedValue = this.globalSearchValue.trim().toLowerCase();

		// If there is a search term, filter the data
		const filteredValues = trimmedValue
			? (this.userCapacity
					.map((hall: any) => {
						// Convert the hallName to lowercase and check if it matches the search term
						const isParentMatch = hall.hallName.toLowerCase().includes(trimmedValue) || hall.hallCustomId.toLowerCase().includes(trimmedValue);

						// Filter subRows based on the search term, converting to lowercase for comparison
						const filteredSubRows = hall.subRows.filter(
							(subRow: any) =>								
								subRow.userName.toLowerCase().includes(trimmedValue) ||
								subRow.userCustomId.toLowerCase().includes(trimmedValue)
						);

						// If the parent matches, include all subRows; otherwise, include only the matching subRows
						if (isParentMatch || filteredSubRows.length > 0) {
							return {
								...hall,
								subRows: isParentMatch ? hall.subRows : filteredSubRows,
							};
						}

						// If nothing matches, return null
						return null;
					})
					.filter((hall: any) => hall !== null) as Hall[])
			: this.userCapacity; // If no search term, return all data

		if (this.childComponent) {
			this.childComponent.data = filteredValues;
			this.childComponent.selectedRowsId = { 0: true };
			this.selectedRowValue = filteredValues?.[0] || {};

			if (filteredValues?.[0]) {
				this.capacitiesComponent.loadCapacitiesForUser(filteredValues[0]);
			}
			this.childComponent.render();
		}
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	handleClose() {
		this.selectedUser = new User().deserialize({});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	processData(data: any) {
		if (this.childComponent) {
			this.childComponent.data = this.childComponent.data.filter(
				(user: User) => user.is_active
			);

			let clickedRow = this.childComponent.data[0];
			if (this.selectedRowValue) {
				let index: number = this.childComponent?.data.findIndex(
					(item: any) => item.id == this.selectedRowValue?.id
				);
				this.childComponent.selectedRowsId = { [index]: true };
				clickedRow = this.selectedRowValue;
			} else {
				this.childComponent.selectedRowsId = { 0: true };
				this.selectedRowValue = clickedRow;
			}

			this.capacitiesComponent.loadCapacitiesForUser(clickedRow);
			this.childComponent.render();
		}
	}

	loadData() {
		let requests: ODataBatchCall[] = [];

		requests.push(
			new ODataBatchCall(0, "get", `Halls?$expand=users&$filter=is_active eq true&$orderby=custom_id asc`)
		);

		requests.push(
			new ODataBatchCall(0, "get", `Users?$filter=is_active eq true and hall_id eq null`)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.halls = response.responses[0]?.body?.value.map((hall: any) =>
					new Hall().deserialize(hall)
				);
				this.columns[0].Header = $localize`Hall (${response.responses[0]?.body?.value.length})`;

				this.users = response.responses[1]?.body?.value?.map((user: User) =>
					new User().deserialize({ ...user })
				);

				this.generateValueForUserCapacity(this.halls, this.users);
			},
			error: e => {},
		});
	}

	generateValueForUserCapacity(halls: any[], users: any[]) {
		let processedData: any[] = [];

		// Add users without halls under "No Hall"
		if (users?.length) {
			processedData.push({
				hallId: "",
				hallCustomId: "",
				hallName: $localize`No Hall`,
				userId: undefined,
				userCustomId: undefined,
				subRows: users.map((user: any) => ({
					hallId: undefined,
					hallCustomId: undefined,
					hallName: undefined,
					userId: user.id,
					userCustomId: user.custom_id,
					userName: user.name,
				})),
			});
		}

		// Process halls with users
		if (halls?.length) {
			processedData.push(
				...halls
					.map((hall: any) => {
						const subRows =
							hall.users?.map((user: any) => ({
								hallId: undefined,
								hallCustomId: undefined,
								hallName: undefined,
								userId: user.id,
								userCustomId: user.custom_id,
								userName: user.name,
							})) || [];

						return subRows.length > 0
							? {
									hallId: hall.id,
									hallCustomId: hall.custom_id,
									hallName: hall.name,
									userId: undefined,
									userCustomId: undefined,
									subRows: subRows,
								}
							: null;
					})
					.filter(Boolean)
			);
		}

		this.userCapacity = processedData;
	}

	updateTableRowCount() {
		this.commonService.get("userCount", false, true).subscribe({
			next: (res: any) => {
				if (this.childComponent) this.childComponent.filteredDataCount = res ?? 0;
			},
			error: err => {
				console.error(err);
			},
		});
	}
}
