import { DatePipe } from "@angular/common";
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	Output,
	ViewChild,
} from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Item } from "@app/shared/models/item.model";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { ProdOrder } from "@app/shared/models/prod-order.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { Button, ComboBox, ComboBoxItem, FlexBox } from "@ui5/webcomponents-react";
import React, { useEffect, useState } from "react";
import { Input as UI5Input } from "@ui5/webcomponents-react";
import { User } from "@app/shared/models/user.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import { UserRegisteredTimes } from "@app/shared/models/user-registered-times.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { StandardValueKeyActivityType } from "@app/shared/models/StandardValueKeyActivityType.model";
import { Localization } from "@app/shared/utils/common-localize";
import { ToastService } from "@app/shared/services/toaster.service";
import Toast from "@ui5/webcomponents/dist/Toast";
import { ProdOrderType } from "@app/shared/enums/ProdOrderType";
import OperationPlan from "@app/shared/models/operation-plan.model";
import moment from "moment";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";

@Component({
	selector: "app-time-record",
	templateUrl: "./time-record.component.html",
	styleUrl: "./time-record.component.css",
	providers: [DatePipe],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class TimeRecordComponent {
	disableButtonDuringRequest = false;
	headerTitle: string = $localize`All List`;
	addButtonText: string = $localize`Save`;
	prodOrders: ProdOrder[] = [];
	isLoading: boolean = false;
	isAdmin: boolean = false;
	topValue: number = 1000;
	totalHours: number = 0;
	isLoadingBatchCall: boolean = false;
	currentDate: string;
	modalType!: string;
	rowIndexToDelete: number | undefined;
	prodOrderPos?: ProdOrderPos;
	isCreateDialogOpen: boolean = false;
	isPreviewDialogOpen: boolean = false;
	previewDialogTitle = $localize`Attachment`;
	isViewDialogOpen = false;
	addButtonDisable = false;
	isSaveProdOrderPos: boolean = false;
	hourValues: number[] = [];
	selectedActivities: { [key: number]: boolean } = {};
	userModel = new User().deserialize({});
	warningForUser = "";
	otherRepairList: any[] = [];
	localization = Localization;

	public isUserValid = true;
	public toastMessage: string = "";
	public selectedUser: string = "";
	public showAttachmentId?: number;
	public fileCount: number = 0;
	selectedOrder?: ProdOrderPos;
	public filePreviewHeight = 629;
	public users: User[] = [];
	public valueKeyTypes: StandardValueKeyActivityType[] = [];
	selectedUserTimeForDelete: UserRegisteredTimes[] = [];
	formatedCurrentDate = this.datePipe.transform(new Date(), "yyyy-MM-dd") || "";
	public isDateUpdate: boolean = false;
	public selectedprodOrderPosOperation?: ProdOrderPosOperation;
	public allOperationPlanList = [];
	public selectedRepair?: Item;
	public userRegisteredTimesData!: UserRegisteredTimes;
	public prodOrderPosOperationData!: ProdOrderPosOperation;
	public allActiveProdOrderPos: ProdOrderPosOperation[] = [];
	public toolVisu = $localize`Tool Visu`;
	@ViewChild("deleteUserRegisteredTimesDataDialog", { static: false })
	deleteUserRegisteredTimesDataDialog: any;
	@Input() userRegisteredTimes: any[] = [];
	@Input() allValueKeyTypeList: StandardValueKeyActivityType[] = [];
	@Output() selectedRowValue: UserRegisteredTimes = new UserRegisteredTimes().deserialize({});
	@ViewChild("childComponentRef", { static: false }) childComponentGrid:
		| CustomReactGridTable
		| undefined;
	@ViewChild("detailComponentRef", { static: false }) detailComponentRefGrid:
		| CustomReactGridTable
		| undefined;
	@ViewChild("userCombobox") userCombobox!: ComboBoxComponent;
	@ViewChild("modalToast", { static: true }) modalToast!: ElementRef<HTMLElement>;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private datePipe: DatePipe,
		public _toasterSrv: ToastService,
		private cdr: ChangeDetectorRef
	) {
		this.currentDate = this.datePipe.transform(new Date(), "yyyy-MM-dd") || "";
		this.modalType = this.authService.isPermissionValid("TIMEVISU_TIME_RECORD_EDIT") || this.authService.isPermissionValid("TIMEVISU_ADMIN")
			? "edit"
			: "view";
	}

	ngOnInit(): void {
		this.isAdmin = this.authService.isPermissionValid("TIMEVISU_ADMIN");
		this.loadData();
		this.fetchUserRegisteredTimes();
		this.fetchProdOrderPosOperations();
	}

	expandQuery = `
 $expand=prodOrderPos($expand=media,prodOrder)&$filter=prodOrderPos/any(p:
p/status ne 'DELETED' and p/status ne 'CLOSED' and p/status_plan ne 'DELETED' and p/status_plan ne 'CLOSED')
`;

	columns: any = [
		{
			Header: $localize`Order No.`,
			accessor: "prodOrderPos.prodOrder.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "start",
		},
		{
			Header: $localize`Tool No.`,
			accessor: "prodOrderPos.item.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "start",
		},
		{
			Header: $localize`Tool Name`,
			accessor: "prodOrderPos.item.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "start",
		},
		{
			Header: $localize`Repair Type`,
			accessor: "operationPlan.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "start",
		},
		{
			Header: $localize`Repair Name`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "start",
		},
		{
			Header: $localize`Start Date Repair`,
			accessor: "prodOrderPos.start",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "End",
			width: 200,
		},
		{
			Header: $localize`Start Date Production`,
			accessor: "prodOrderPos.release_date",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "End",
			width: 200,
		},
		{
			Header: $localize`Responsible`,
			accessor: "prodOrderPos.user.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "start",
		},
		{
			Header: $localize`Attachment`,
			accessor: "id",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const mediaLength = rowData.prodOrderPos.media
					? rowData.prodOrderPos.media.length
					: 0;
				const label = mediaLength === 1 ? $localize`File` : $localize`Files`;
				let totalAttachments: any[] = [];
				rowData.prodOrderPos.media?.map((item: any) => {
					totalAttachments.push(item.id);
				});
				if (mediaLength > 0) {
					return (
						<Button
							design="Default"
							icon="attachment"
							className="w-20 h-6 rounded-lg flex items-center font-bold text-xs"
							onClick={() => this.showPreview(rowData, totalAttachments.length)}>
							{mediaLength} {label}
						</Button>
					);
				} else {
					return null;
				}
			},
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			hAlign: "Center",
			disableGroupBy: true,
			disableResizing: true,
			disableSortBy: true,
			isSelected: true,
			minWidth: 150,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<Button
							id="addButton"
							design="Emphasized"
							disabled={
								!this.authService.isPermissionValid("TIMEVISU_TIME_RECORD_EDIT")
							}
							onClick={() => this.onAddProdOrderPosOperation(rowData)}
							className="h-6 text-white bg-blue-600 rounded-lg flex items-center font-bold text-xs ml-1 mr-1">
							{$localize`Add`}
						</Button>

						<Button
							id="infoButton"
							design="Default"
							icon="message-information"
							onClick={() => this.openViewModal(rowData)}
							className="border-none"
						/>
					</React.StrictMode>
				);
			},
		},
	];

	DetailTableColumns: any = [
		{
			maxWidth: 293,
			Header: this.localization.name,
			accessor: "prodOrderPosOperation.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Type`,
			minWidth: 100,
			accessor: "prodOrderPosOperation?.prodOrderPos?.prodOrder?.order_type",
			hAlign: "",
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				return (
					<React.StrictMode>
						<FlexBox>
							<div className="h-4 px-1 bg-blue-600 rounded flex items-center font-bold text-xs text-white">
								{this.toolVisu}
							</div>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Activities`,
			accessor: "...",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Start",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowIndex = row.index;
				return (
					<React.StrictMode>
						<ComboBox
							value={
								this.userRegisteredTimes[rowIndex].standardValueKeyActivityType?.pos
							}
							onInput={(e: any) => this.activityTypeChange(e, rowIndex)}
							onSelectionChange={(e: any) => this.activityTypeChange(e, rowIndex)}
							disabled={
								!this.authService.isPermissionValid("TIMEVISU_TIME_RECORD_EDIT")
							}
							placeholder={$localize`Select Activities`}
							valueState="None">
							{this.valueKeyTypes?.map((value: StandardValueKeyActivityType) => (
								<ComboBoxItem
									key={value.id}
									id={value.id!.toString()}
									text={value.pos}
								/>
							))}
						</ComboBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Hour`,
			accessor: "hours_split",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Start",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const [valueState, setValueState] = useState(
					this.userRegisteredTimes?.[row.index]?.hours_split ? ValueState.None : ValueState.Negative
				);
				useEffect(() => {
					setValueState(
						this.userRegisteredTimes?.[row.index]?.hours_split ? ValueState.None : ValueState.Negative
					);
				}, [this.userRegisteredTimes[row.index]?.hours_split, this.currentDate]);

				return (
					<React.StrictMode>
						<UI5Input
							type="Number"
							value={this.userRegisteredTimes?.[row.index]?.hours_split || ""}
							disabled={
								!this.authService.isPermissionValid("TIMEVISU_TIME_RECORD_EDIT")
							}
							onInput={(e: any) => {
								const newValue = e.target.value;
								this.userRegisteredTimes[row.index].hours_split = newValue;

								if (newValue === "" || parseFloat(newValue) === 0) {
									setValueState(ValueState.Negative);
								} else {
									setValueState(ValueState.None);
								}
								this.onHourInputChange(newValue, row.index);
							}}
							valueState={valueState}
							placeholder={$localize`Enter Hours`}
						/>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			hAlign: "Center",
			disableGroupBy: true,
			disableResizing: true,
			disableSortBy: true,
			id: "actions",
			maxWidth: 72,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<Button
							id="deleteButton"
							disabled={
								!this.authService.isPermissionValid("TIMEVISU_TIME_RECORD_EDIT")
							}
							design="Transparent"
							icon="delete"
							onClick={() => this.deleteClickMultiple(row.index)}
							className="border-none"
						/>
					</React.StrictMode>
				);
			},
		},
	];

	fetchProdOrderPosOperations() {
		if (this.childComponentGrid) {
			this.childComponentGrid.isBusy = true;
			this.childComponentGrid.render();
		}

		this.allActiveProdOrderPos = [];

		this.commonService.get(`prod-order-pos-operation/time-record`, false).subscribe({
			next: (response: any) => {
				this.allActiveProdOrderPos = response.data?.map((data: any) => {
					if (data.prodOrderPos) {
						data.prodOrderPos.start = data.prodOrderPos.start
							? this.datePipe.transform(
									new Date(data.prodOrderPos.start?.split(" ")[0]),
									"dd.MM.yyyy"
								)
							: "";
						data.prodOrderPos.release_date = data.prodOrderPos.release_date
							? this.datePipe.transform(
									new Date(data.prodOrderPos.release_date?.split(" ")[0]),
									"dd.MM.yyyy"
								)
							: "";
					}

					return data;
				});

				if (this.childComponentGrid) {
					this.childComponentGrid.isBusy = false;
					this.childComponentGrid.render();
				}
			},
			error: (e: any) => {
				this.userRegisteredTimes = [];
				if (this.childComponentGrid) {
					this.childComponentGrid.isBusy = false;
					this.childComponentGrid.render();
				}
				console.error("Error fetching UserRegisteredTimes: ", e);
			},
		});
	}

	onHourInputChange(newValue: string, index: number) {
		const parsedValue = parseFloat(newValue) || 0;
		this.hourValues[index] = parsedValue;

		if (this.userRegisteredTimes && this.userRegisteredTimes[index]) {
			this.userRegisteredTimes[index].hours_split = parsedValue;
		}
		this.updateTotalSum();
	}

	updateTotalSum() {
		this.totalHours = this.userRegisteredTimes.reduce((sum, row) => {
			return sum + (parseFloat(row.hours_split) || 0);
		}, 0);
	}

	getProcessData(data: any) {
		const tableData = data[0]?.filter(
			(order: ProdOrderPosOperation) =>
				order.prodOrderPos?.prodOrder?.order_type == ProdOrderType.MAINTENANCE
		);

		if (this.childComponentGrid) {
			this.childComponentGrid.data = tableData;
			this.childComponentGrid.render();
		}
	}

	activityTypeChange(event: any, rowIndex: number) {
		if (event.detail) {
			const selectedId = parseInt(event.detail.item?.id);
			let tempData = this.valueKeyTypes.find((elm: any) => elm.id == selectedId);
			this.userRegisteredTimes[rowIndex] = {
				...this.userRegisteredTimes[rowIndex],
				standard_value_key_activity_type_id: selectedId,
				pos: tempData?.id,
			};
		} else {
			this.userRegisteredTimes[rowIndex] = {
				...this.userRegisteredTimes[rowIndex],
				standard_value_key_activity_type_id: null,
			};
		}
		this.childComponentGrid?.render();
	}

	showModalToast(message: string, type: string) {
		this.toastMessage = message;
		const toast = document.getElementById("modalToast") as Toast;
		toast.className = this._toasterSrv.setToasterType(type);
		toast.open = true;
	}

	checkValidDataBeforeSaving(): boolean {
		let isValid = true;
		const dateToSave = this.isDateUpdate ? this.selectedRowValue?.date : this.currentDate;
		if (!dateToSave) {
			this.showModalToast($localize`Date not valid!`, "error");
			return false;
		}

		if (this.totalHours > 12) {
			this.showModalToast("Total hours exceed 12 hours. Cannot save data!", "error");
			return false;
		}

		this.userRegisteredTimes.forEach((item: any) => {
			const hoursSplit = item.hours_split;

			if (!hoursSplit) {
				this.showModalToast($localize`Fill the Hour Field!`, "error");
				isValid = false;
			}
		});
		return isValid;
	}

	async onAddProdOrderPosOperation(value: any) {
		if (this.isAdmin) {
			if (!this.selectedRowValue.user.id) {
				this.checkRequiredComboboxes();
				this.showModalToast($localize`Select a User First!`, "error");
				return;
			}
		}

		if (!this.currentDate) {
			this.showModalToast($localize`Date is Required!`, "error");
			return;
		}

		this.selectedprodOrderPosOperation = new ProdOrderPosOperation().deserialize(value);
		const orderType = this.prodOrderPosOperationData?.prodOrderPos?.prodOrder?.order_type;
		const prodOrderPosOperationId = value;
		const machineId = value.machine_id;
		this.userRegisteredTimesData = new UserRegisteredTimes().deserialize({});
		this.userModel = new User().deserialize({});
		this.prodOrderPosOperationData = new ProdOrderPosOperation().deserialize({});
		this.prodOrderPosOperationData.prodOrderPos =
			this.selectedprodOrderPosOperation?.prodOrderPos;
		this.userRegisteredTimes.push({
			order_type: orderType,
			prod_order_pos_operation_id: prodOrderPosOperationId.id,
			machine_id: machineId,
			prodOrderPosOperation: prodOrderPosOperationId,
		});
		this.addButtonDisable = this.userRegisteredTimes?.length ? false : true;
		this.detailComponentRefGrid?.render();
	}

	saveUserRegisteredTimes() {
		if (!this.checkValidDataBeforeSaving()) {
			return;
		}

		this.addButtonDisable = true;
		this.detailComponentRefGrid?.render();

		let requests: ODataBatchCall[] = [];
		this.isLoading = true;
		let selectedUserId = this.isAdmin
			? this.selectedRowValue.user.id
			: this.authService.loggedInUser.id;
		let dateToSave = this.isDateUpdate ? this.selectedRowValue.date : this.currentDate;
		let postData = this.userRegisteredTimes
			.filter((item: any) => {
				return !item.isSaved && !item.id;
			})
			.map((item: any) =>
				new UserRegisteredTimes()
					.deserialize({
						date: dateToSave,
						is_generated: false,
						user: { id: selectedUserId },
						hours_split: item.hours_split,
						prodOrderPosOperation: { id: item.prod_order_pos_operation_id },
						machine: { id: item.machine_id },
						standard_value_key_activity_type_id:
							item.standard_value_key_activity_type_id,
					})
					.toOdata()
			);

		let putData = this.userRegisteredTimes
			.filter((item: any) => item.id)
			.map((item: any) =>
				new UserRegisteredTimes()
					.deserialize({
						id: item.id,
						date: dateToSave,
						is_generated: item.is_generated,
						user: { id: selectedUserId },
						hours_split: item.hours_split,
						prodOrderPosOperation: { id: item.prod_order_pos_operation_id },
						machine: { id: item.machine_id },
						standard_value_key_activity_type_id:
							item.standard_value_key_activity_type_id,
					})
					.toOdata()
			);

		if (postData.length > 0) {
			postData.forEach((data: any) => {
				let requestData = new ODataBatchCall(0, "post", `/odata/UserRegisteredTimes`);
				requestData.body = data;
				requests.push(requestData);
			});
		}

		if (putData.length > 0) {
			putData.forEach((data: any) => {
				let requestData = new ODataBatchCall(
					0,
					"put",
					`/odata/UserRegisteredTimes(${data.id})`
				);
				requestData.body = data;
				requests.push(requestData);
			});
		}

		if (requests.length === 0) {
			this.isLoading = false;
			return;
		}

		this.commonService.post(`$batch`, { requests }).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
				this.isLoading = false;
				this.userRegisteredTimes.forEach((item: any) => {
					if (!item.isSaved) {
						item.isSaved = true;
					}
				});
				this.fetchUserRegisteredTimes();
				this.addButtonDisable = false;
				this.detailComponentRefGrid?.render();
			},
			error: () => {
				this.isLoading = false;
				this.addButtonDisable = false;
				this.detailComponentRefGrid?.render();
			},
		});
	}

	checkRequiredComboboxes(): boolean {
		if (!this.userCombobox.element.value) {
			this.userCombobox.element.valueState = "Negative";
			return false;
		} else {
			this.userCombobox.element.valueState = "None";
		}
		return true;
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	onUserInputChange(event: any) {
		const inputValue = event.target.value.trim();
		this.selectedUser = inputValue;

		if (!inputValue) {
			this.isUserValid = false;
			this.selectedRowValue.user = new User().deserialize({
				id: null,
				name: "",
			});

			this.userRegisteredTimes = [];
			this.addButtonDisable = true;
			this.updateTotalSum();

			return;
		}

		const matchUserData = this.users.find(user => user.name === inputValue);

		if (!matchUserData) {
			this.isUserValid = false;
			this.selectedRowValue.user = new User().deserialize({
				id: null,
				name: "",
			});
			this.userRegisteredTimes = [];
			this.addButtonDisable = true;
			this.updateTotalSum();
		} else {
			this.isUserValid = true;
			this.selectedRowValue.user = matchUserData;
			this.fetchUserRegisteredTimes();
		}
	}

	checkProparData() {
		this.warningForUser = this.selectedRowValue.user?.id ? "None" : "Error";
		return !!this.selectedRowValue.user?.id;
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponentGrid?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	formatDate(inputDate: string): string {
		if (inputDate.includes("-")) {
			return inputDate;
		} else {
			const date = new Date(inputDate);
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, "0");
			const day = date.getDate().toString().padStart(2, "0");
			return `${year}-${month}-${day}`;
		}
	}

	async fetchUserRegisteredTimes() {
		let formattedDate = structuredClone(this.currentDate);

		const userId = this.isAdmin
			? this.selectedRowValue?.user?.id
			: this.authService.loggedInUser.id;

		if (!userId || !this.currentDate) {
			return;
		}

		if (this.detailComponentRefGrid) {
			this.detailComponentRefGrid.isBusy = true;
			this.detailComponentRefGrid.render();
		}

		if (formattedDate.includes(".")) {
			const [day, month, year] = formattedDate.split(".");
			formattedDate = `${year}-${month}-${day}`;
		} else {
			formattedDate = this.formatDate(formattedDate);
		}

		this.commonService
			.get(
				`/UserRegisteredTimes?$expand=prodOrderPosOperation($expand=prodOrderPos($expand=prodOrder)),standardValueKeyActivityType&$filter=user_id eq '${userId}' and date eq '${formattedDate}'`
			)
			.subscribe({
				next: (response: any) => {
					if (
						(this.isAdmin && this.selectedRowValue?.user?.id) ||
						(!this.isAdmin && this.authService.loggedInUser.id)
					) {
						this.userRegisteredTimes = response.value?.filter(
							(userRegisteredTimes: UserRegisteredTimes) =>
								userRegisteredTimes.prodOrderPosOperation?.prodOrderPos?.prodOrder
									?.order_type == ProdOrderType.MAINTENANCE
						);

						this.updateTotalSum();
					}

					if (this.detailComponentRefGrid) {
						this.detailComponentRefGrid.isBusy = false;
						this.detailComponentRefGrid.addButtonDisable = false;
						this.detailComponentRefGrid.render();
					}
				},
				error: (e: any) => {
					this.userRegisteredTimes = [];
					if (this.detailComponentRefGrid) {
						this.detailComponentRefGrid.isBusy = false;
						this.detailComponentRefGrid.render();
					}
					console.error("Error fetching UserRegisteredTimes: ", e);
				},
			});
	}

	loadData() {
		let requests: ODataBatchCall[] = [];

		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/Users?$expand=user($select=custom_id)&$top=${this.topValue}`
			)
		);
		requests.push(
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/StandardValueKeyActivityTypes?$expand=standardValueKey($select=id)&$top=${this.topValue}`
			)
		);
		requests.push(
			new ODataBatchCall(
				2,
				"get",
				`OperationPlans?$select=id,custom_id&$filter=custom_id ne null`
			)
		);

		this.isLoadingBatchCall = true;
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map((user: User) => {
					const deserializedUser = new User().deserialize(user);
					this.users.push(deserializedUser);
				});

				this.allOperationPlanList = response.responses[2]?.body?.value?.map(
					(elm: OperationPlan) => new OperationPlan().deserialize(elm)
				);

				//TODO: Will be added later after the full requirements
				// response.responses[1]?.body?.value?.map(
				// 	(standardValueKeyActivityTypes: StandardValueKeyActivityType) => {
				// 		const deserializedvalueKey = new StandardValueKeyActivityType().deserialize(
				// 			standardValueKeyActivityTypes
				// 		);
				// 		this.valueKeyTypes.push(deserializedvalueKey);
				// 	}
				// );
			},
			error: () => {},
		});
	}

	closeAttachmentDialog() {
		this.isPreviewDialogOpen = false;
	}

	showPreview(prodOrderPos: any, count: number) {
		this.prodOrderPosOperationData = new ProdOrderPosOperation().deserialize(prodOrderPos);
		this.showAttachmentId = this.prodOrderPosOperationData?.prodOrderPos?.id;
		this.fileCount = count;
		this.isPreviewDialogOpen = true;
	}

	setModelType(repair: any) {
		switch (true) {
			case this.isAdmin:
				this.modalType = "edit";
				break;

			case this.authService.loggedInUser.id == repair.prodOrderPos.user?.id && this.authService.isPermissionValid("TIMEVISU_TIME_RECORD_EDIT"):
				this.modalType = "edit";
				break;

			default:
				this.modalType = "view";
				break;
		}
	}

	openViewModal(repair: ProdOrderPosOperation) {
		this.setModelType(repair);

		(this.selectedOrder = repair?.prodOrderPos), (this.isViewDialogOpen = true);
		try {
			this.commonService
				.get(
					`ProdOrderPos(${repair.prodOrderPos?.id})?$expand=media($select=id),userCreator($select=id,name,custom_id),userResponsible($select=id,name,custom_id),item($select=id,name,custom_id,is_active,is_tool),prodOrder($select=id,custom_id,order_type),prodOrderPosOperations($expand=operationPlan($select=id,custom_id),operationPlanPos($select=id,name))`
				)
				.subscribe({
					next: (response: any) => {
						this.selectedOrder = new ProdOrderPos().deserialize(response);
					},
					error: e => {
						console.error("Error while getting ProdOrderPos: ", e);
						this.isLoading = false;
					},
				});
		} catch (error) {
			this.isLoading = false;
		}
	}

	async onAddRepair(repair: any) {
		this.isCreateDialogOpen = true;
		this.selectedRepair = new Item().deserialize(repair);
	}

	closeDialogDelete() {
		this.deleteUserRegisteredTimesDataDialog.elementRef.nativeElement.open = false;
		if (this.detailComponentRefGrid) {
			this.detailComponentRefGrid.isNoDataSelected = true;
			this.detailComponentRefGrid.selectedRowsId = {};
			this.selectedUserTimeForDelete = [];
			this.detailComponentRefGrid.render();
		}
	}

	deleteSingleDetails() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		if (this.rowIndexToDelete === undefined) {
			return;
		}

		if (this.rowIndexToDelete >= 0 && this.rowIndexToDelete < this.userRegisteredTimes.length) {
			const recordToDelete = this.userRegisteredTimes[this.rowIndexToDelete];
			if (recordToDelete && recordToDelete.id) {
				this.commonService.delete(`/UserRegisteredTimes(${recordToDelete.id})`).subscribe({
					next: () => {
						this.closeDialogDelete();
						this.isLoading = false;
						this.userRegisteredTimes.splice(this.rowIndexToDelete!, 1);
						this.disableButtonDuringRequest = false;
						this.detailComponentRefGrid?.render();
						this.updateTotalSum();
						this._toasterSrv.showToast(recordDeleted, "success");
					},
					error: e => {
						alert(e.message);
						this.disableButtonDuringRequest = false;
						this.isLoading = false;
					},
				});
			} else {
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this.userRegisteredTimes.splice(this.rowIndexToDelete!, 1);
				this.detailComponentRefGrid?.render();
				this.closeDialogDelete();
				this.updateTotalSum();
				this.cdr.markForCheck();
			}
		} else {
			console.warn(`Invalid row index: ${this.rowIndexToDelete}`);
		}
	}

	deleteMultipleDetails() {
		const { recordDeleted } = Localization;
		let requests: ODataBatchCall[] = [];
		this.isLoading = true;

		this.selectedUserTimeForDelete.forEach((element: UserRegisteredTimes) => {
			let counter = 0;
			if (element.id) {
				let requestData = new ODataBatchCall(
					counter,
					"delete",
					`/odata/UserRegisteredTimes(${element.id})`
				);

				counter++;
				requests.push(requestData);
			}
			this.userRegisteredTimes = this.userRegisteredTimes.filter(
				(userTimes: UserRegisteredTimes) =>
					JSON.stringify(element) != JSON.stringify(userTimes)
			);
		});

		if (requests.length) {
			this.commonService.post("$batch", { requests }).subscribe({
				next: () => {
					this.isLoading = false;
					this.disableButtonDuringRequest = false;
					this.detailComponentRefGrid!.isNoDataSelected = true;
					this.selectedUserTimeForDelete = [];
					this.detailComponentRefGrid?.render();
					this.updateTotalSum();
					this._toasterSrv.showToast(recordDeleted, "success");
					this.closeDialogDelete();
				},
				error: () => {
					this.isLoading = false;
					this.disableButtonDuringRequest = false;
					this.closeDialogDelete();
				},
			});
		} else {
			this.detailComponentRefGrid!.isNoDataSelected = true;
			this.detailComponentRefGrid!.selectedRowsId = {};
			this.selectedUserTimeForDelete = [];
			this.detailComponentRefGrid?.render();
			this.isLoading = false;
			this.closeDialogDelete();
		}
	}

	onDateChange(event: any) {
		this.currentDate = event.target.value;
		this.selectedRowValue.date = event.target.value;
		this.isDateUpdate = true;

		if (this.selectedRowValue && this.currentDate) {
			this.fetchUserRegisteredTimes();
		}
	}

	onDateInput(event: any) {
		this.userRegisteredTimes = [];
		if (this.detailComponentRefGrid) {
			this.detailComponentRefGrid.isBusy = false;
			this.detailComponentRefGrid.render();
		}
	}

	onChangeUser(event: any) {
		this.userCombobox.element.valueState = "None";
		if (!this.selectedRowValue?.user) {
			this.selectedRowValue.user = new User();
		}
		this.selectedRowValue.user = new User().deserialize({
			id: parseInt(event.detail.item.id) || 0,
			name: event.detail.item.text || "",
			custom_id: event.detail.item.additionalText || "",
		});
		this.fetchUserRegisteredTimes();
	}

	closeUpdateDialog() {
		this.isViewDialogOpen = false;
		if (this.isSaveProdOrderPos) this.fetchProdOrderPosOperations();
	}

	isSavedModal() {
		this.isSaveProdOrderPos = true;
		this.fetchProdOrderPosOperations();
	}

	rowSelectionChangeForDetails(e: any) {
		this.selectedUserTimeForDelete = [];
		e.detail.selectedFlatRows?.forEach((item: any) => {
			this.selectedUserTimeForDelete.push(item?.original);
		});
	}

	deleteClickMultiple(rowIndex?: number): void {
		if (rowIndex !== undefined) {
			this.rowIndexToDelete = rowIndex;
		}

		if (this.deleteUserRegisteredTimesDataDialog?.elementRef.nativeElement) {
			this.deleteUserRegisteredTimesDataDialog.elementRef.nativeElement.open = true;
		}
	}

	onDelete() {
		if (this.selectedUserTimeForDelete.length) {
			this.deleteMultipleDetails();
		} else {
			this.deleteSingleDetails();
		}
	}
}
