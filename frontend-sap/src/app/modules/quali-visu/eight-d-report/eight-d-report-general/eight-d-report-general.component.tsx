import {
	AfterViewInit,
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";

import ButtonDesign from "@ui5/webcomponents/dist/types/ButtonDesign";
import React from "react";
import moment from "moment";

import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { ICustomButton } from "@app/shared/interfaces/custom-button.interface";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { User } from "@app/shared/models/user.model";
import { EightDReport } from "@app/shared/models/eight-d-report.model";
import { Plant } from "@app/shared/models/plant.model";
import { Suppliers } from "@app/shared/models/suppliers.model";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";

@Component({
	selector: "app-eight-d-report-general",
	templateUrl: "./eight-d-report-general.component.html",
	styleUrl: "./eight-d-report-general.component.css",
})
export class EightDReportGeneralComponent implements OnChanges, AfterViewInit {
	@ViewChild("generalRef", { static: false }) generalGrid: CustomReactGridTable | undefined;
	@ViewChild("generalForm") generalForm: NgForm | undefined;

	@Input() eightDReport: EightDReport = {
		title: "",
		supplier: new Suppliers().deserialize({}),
		description: "",
		complaint_no: "",
		complaint_opening_date: "",
		revision_date: "",
		production_site: "",
		part_name: "",
		drawing_revision: "",
		plant: new Plant().deserialize({}),
		team: [],
	};

	@Input() isSaving: boolean = false;

	isBatchCallRunning: boolean = false;

	allUsers: User[] = [];

	columns: any = [
		{
			Header: $localize`No.`,
			accessor: "no",
			hAlign: "Right",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			width: 50,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const index = row.index;
				rowData.no = index;
				return (
					<React.StrictMode>
						<div>{index || ""}</div>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Name`,
			accessor: "id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.DropdownSingle,
			noTypeAhead: true,
			placeholder: (row: any) => {
				return row.id > 0 ? $localize`Select Team Member` : $localize`Select Team Leader`;
			},
			comboBoxValues: [],
			showClearIcon: true,
			onInput: this.clearMember.bind(this),
			onSelectChange: this.updateTeamMemberInfo.bind(this),
		},
		{
			Header: $localize`Department`,
			accessor: "department",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			isDisabled: true,
			dataType: GridTableColumnDataType.InputField,
		},
		{
			Header: $localize`Email`,
			accessor: "email",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			isDisabled: true,
			dataType: GridTableColumnDataType.InputField,
		},
	];

	customButtons: ICustomButton[] = [
		{
			id: "addmember",
			text: $localize`Add`,
			design: ButtonDesign.Emphasized,
			hide: (row: any) => row.index > 0,
			onClick: this.addMember.bind(this),
		},
		{
			id: "deleteMember",
			icon: "delete",
			hide: (row: any) => row.index == 0,
			onClick: this.deleteMember.bind(this),
		},
	];

	defaultdata: any[] = [
		{
			id: null,
			department: "",
			email: "",
		},
		{
			id: null,
			department: "",
			email: "",
		},
	];

	data: any[] = [];

	suppliers: Suppliers[] = [];
	plants: Plant[] = [];

	supplierValue = "";
	plantValue = "";

	constructor(private qualiVisuService: QualiVisuService) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["eightDReport"]?.currentValue?.id) {
			this.supplierValue = this.eightDReport.supplier?.name ?? "";
			this.plantValue = this.eightDReport.plant?.name ?? "";
			if (this.eightDReport?.team?.length) {
				this.data = [
					...this.eightDReport.team.map((m: any) => {
						return {
							...m,
							department: m?.userGroup?.length
								? m?.userGroup[0].name
								: (m.department ?? ""),
						};
					}),
				];
			} else {
				this.defaultdata.map(d => {
					d.id = null;
					return d;
				});

				this.data = [...this.defaultdata];
				this.generalGrid?.render();
			}
			this.broadCastUpdatedTeamMembers();
			this.generalGrid?.render();
		} else if (changes["eightDReport"]?.currentValue?.id == 0) {
			this.supplierValue = "";
			this.plantValue = "";
			this.defaultdata.map(d => {
				d.id = null;
				return d;
			});
			this.data = [...this.defaultdata];
			this.generalGrid?.render();
		}
	}

	ngAfterViewInit(): void {
		this.batchCall();
	}

	batchCall() {
		this.isBatchCallRunning = true;
		let requests: ODataBatchCall[] = [];
		requests.push(new ODataBatchCall(0, "get", `\/odata\/Users?$expand=userGroup`));
		requests.push(new ODataBatchCall(0, "get", `\/odata\/Suppliers`));
		requests.push(new ODataBatchCall(0, "get", `\/odata\/Plants`));

		this.qualiVisuService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.columns.find((c: any) => c.accessor == "id").comboBoxValues = structuredClone(
					response.responses[0].body.value.map((user: User) => {
						return { value: user.id, text: user.name };
					})
				);

				this.allUsers = response.responses[0].body.value;
				this.suppliers = response.responses[1].body.value;
				this.plants = response.responses[2].body.value;
				this.broadCastUpdatedTeamMembers();

				this.isBatchCallRunning = false;
			},
			error: e => {
				this.isBatchCallRunning = false;
			},
		});
	}

	checkSupplierValue() {
		if (!this.suppliers.some(s => s.name == this.supplierValue)) {
			this.eightDReport.supplier_id = null;
		}
	}

	checkPlantValue() {
		if (!this.plants.some(p => p.name == this.plantValue)) {
			this.eightDReport.plant_id = null;
		}
	}

	setSupplierValue(event: any) {
		this.eightDReport.supplier_id = Number(event.item.id);
	}

	setPlantValue(event: any) {
		this.eightDReport.plant_id = Number(event.item.id);
	}

	broadCastUpdatedTeamMembers() {
		let updatedTeamMembers = this.allUsers.filter(m => this.data.some(d => d.id == m.id));
		this.qualiVisuService.updateTeamMembers([...updatedTeamMembers]);
	}

	updateTeamMemberInfo(row: any) {
		let selectedUser = new User().deserialize(
			this.allUsers.find((u: User) => u.id == row.original.id)
		);
		this.data[row.index] = {
			...this.data[row.index],
			department: selectedUser?.user_group?.length
				? selectedUser?.user_group[0].name
				: (this.data[row.index].department ?? ""),
			email: selectedUser?.email ?? "",
		};

		this.eightDReport.team = [...this.data];

		this.generalGrid?.onFilterAndSorting();
	}

	clearMember(row: any) {
		this.data[row.index] = { ...this.data[row.index], id: null, department: "", email: "" };

		this.eightDReport.team = [...this.data];

		this.generalGrid?.onFilterAndSorting();
	}

	addMember() {
		this.data.push({
			id: null,
			department: "",
			email: "",
		});

		this.eightDReport.team = [...this.data];

		this.generalGrid?.onFilterAndSorting();
	}

	deleteMember(row: any) {
		this.data = this.data.filter(d => d.no != row.original.no);
		this.data = this.data.map((d, i) => {
			d.no = i > 0 ? i : "";
			return d;
		});

		this.eightDReport.team = [...this.data];

		this.generalGrid?.onFilterAndSorting();
	}
}
