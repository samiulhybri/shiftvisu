import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	Output,
	QueryList,
	ViewChildren,
} from "@angular/core";

import React from "react";
import { lastValueFrom } from "rxjs";

import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import {
	EightDReportIshikawaCategory,
	EightDReportIshikawaCategoryClass,
} from "@app/shared/enums/EightDReportIshikawaCategory";
import { EightDReportIshikawa } from "@app/shared/models/eight-d-report-ishikawa.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ICustomButton } from "@app/shared/interfaces/custom-button.interface";
import { EightDReportFiveWhy } from "@app/shared/models/eight-d-report-five-why.model";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";

@Component({
	selector: "app-ishikawa",
	templateUrl: "./ishikawa.component.html",
	styleUrl: "./ishikawa.component.css",
})
export class IshikawaComponent implements AfterViewInit {
	@ViewChildren(CustomReactGridTable) gridTables!: QueryList<CustomReactGridTable>;

	@Input() eightDReportId: number = 0;

	@Input() saveMode: "post" | "patch" | null = null;

	@Output() saveModeChange = new EventEmitter<"post" | "patch" | null>();

	isIshikawaLoading: boolean = false;

	ishikawaCategoryArray: any[] = EightDReportIshikawaCategoryClass.getEnumArray();

	deleteIds: number[] = [];

	baseUrl = "/EightDReportIshikawas";

	columns = [
		{
			Header: $localize`No.`,
			accessor: "no",
			hAlign: "Right",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			autoResizable: true,
			width: 50,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const index = row.index;

				return (
					<React.StrictMode>
						<div>{index + 1}</div>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Name`,
			accessor: "name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			autoResizable: true,
			dataType: GridTableColumnDataType.InputField,
		},
	];

	data: EightDReportIshikawa[] = [];

	defaultIshikawa: Partial<EightDReportIshikawa> = {
		name: "",
	};

	customButtons: ICustomButton[] = [
		{
			id: "deleteMember",
			icon: "delete",
			onClick: this.deleteMember.bind(this),
		},
	];

	constructor(private qualiVisuService: QualiVisuService) {}

	ngAfterViewInit(): void {
		this.updateIshikawaData();
	}

	updateIshikawaData() {
		if (this.eightDReportId) {
			this.data = [];
			this.deleteIds = [];
			this.isIshikawaLoading = true;
			let requests: ODataBatchCall[] = [];

			this.ishikawaCategoryArray.forEach((c, i) => {
				let url = `/odata${this.baseUrl}?$filter=eight_d_report_id eq ${this.eightDReportId} and category eq '${c.value}'`;
				requests.push(new ODataBatchCall(i, "get", url));
			});

			this.qualiVisuService.post("$batch", { requests }).subscribe((response: any) => {
				this.ishikawaCategoryArray.forEach((c, i) => {
					this.data = [...this.data, ...response.responses[i].body.value];
				});

				this.isIshikawaLoading = false;
			});
		}
	}

	deleteMember(row: any) {
		if (row.original.id) {
			this.deleteIds.push(row.original.id);

			this.data = this.data.filter(d => d.id != row.original.id);
		}
		else {
			let filteredRow = this.data.filter(d => d.category == row.original.category).find((d,i)=> i == row.index);
			this.data = this.data.filter(d => d != filteredRow);
		}
	}

	processData(data: any[], recentData: any[]) {
		this.data = data;
	}

	newButtonClick(category: EightDReportIshikawaCategory) {
		this.data.push({ ...this.defaultIshikawa, category: category });
		this.data = [...this.data];
	}

	filterOnCategory(category: EightDReportIshikawaCategory) {
		return this.data.filter(d => d.category == category);
	}

	updateSaveMode(mode: "post" | "patch" | null) {
		this.saveMode = mode;
		this.saveModeChange.emit(mode);
	}

	async saveData() {
		this.updateSaveMode(null);
		let requests: ODataBatchCall[] = [];
		this.data.forEach((d, i) => {
			let payload: EightDReportFiveWhy = {
				...d,
			};

			if (d.id) {
				let request = new ODataBatchCall(i, "patch", `/odata${this.baseUrl}/${d.id}`);
				request.body = payload;

				requests.push(request);
			} else if (d.name) {
				payload.eight_d_report_id = this.eightDReportId;
				let request = new ODataBatchCall(i, "post", `/odata${this.baseUrl}`);
				request.body = payload;

				requests.push(request);
			}
		});

		let nextIndex = requests.length;

		this.deleteIds.forEach((id, i) => {
			let request = new ODataBatchCall(
				nextIndex + i,
				"delete",
				`/odata${this.baseUrl}/${id}`
			);

			requests.push(request);
		});

		await lastValueFrom(this.qualiVisuService.post("$batch", { requests }));
	}
}
