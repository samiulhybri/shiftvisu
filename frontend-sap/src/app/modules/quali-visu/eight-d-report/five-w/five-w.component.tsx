import {
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
} from "@angular/core";

import React from "react";
import { lastValueFrom } from "rxjs";

import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { EightDReportFiveWhy } from "@app/shared/models/eight-d-report-five-why.model";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";

@Component({
	selector: "app-five-w",
	templateUrl: "./five-w.component.html",
	styleUrl: "./five-w.component.css",
})
export class FiveWComponent implements OnChanges {
	@ViewChild("fiveWhyRef", { static: false }) fiveWhyRefGrid: CustomReactGridTable | undefined;

	@Input() eightDReportId: number = 0;

	@Input() saveMode: "post" | "patch" | null = null;

	@Output() saveModeChange = new EventEmitter<"post" | "patch" | null>();
	@Output() closeDialogue = new EventEmitter<void>();
	@Output() selectNextTab = new EventEmitter<void>();

	baseUrl = "/EightDReportFiveWhies";

	singleWhy = {
		question: "",
		answer: "",
	};

	columns = [
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

				return (
					<React.StrictMode>
						<div>{index + 1}W</div>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Question`,
			accessor: "question",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			numberOfRows: 3,
			dataType: GridTableColumnDataType.InputArea,
			placeholder: "Write here...",
		},
		{
			Header: $localize`Answer`,
			accessor: "answer",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			numberOfRows: 3,
			dataType: GridTableColumnDataType.InputArea,
			placeholder: "Write here...",
		},
	];
	data: EightDReportFiveWhy[] = [];

	filterQuery = `eight_d_report_id eq ${this.eightDReportId}`;

	constructor(
		private qualiVisuService: QualiVisuService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["eightDReportId"]?.currentValue != changes["eightDReportId"]?.previousValue) {
			this.filterQuery = `eight_d_report_id eq ${this.eightDReportId}`;
			this.cdr.detectChanges();
			this.fiveWhyRefGrid?.render();
		}
	}

	updateSaveMode(mode: "post" | "patch" | null) {
		this.saveMode = mode;
		this.saveModeChange.emit(mode);
	}

	processData(data: EightDReportFiveWhy[], recentData: any[]) {
		this.data = data;
		this.fillArrayWithDefaultValues();
	}

	newButtonClick() {
		if(this.fiveWhyRefGrid?.isBusy) {
			return;
		}
		
		this.data.push({
			question: "",
			answer: "",
		});
	}

	fillArrayWithDefaultValues() {
		if (this.data.length >= 5) {
			return;
		} else {
			let remaining = 5 - this.data.length; //5 Why

			this.data = [
				...this.data,
				...Array.from({ length: remaining }, () => ({
					...this.singleWhy,
				})),
			];
		}
	}

	async saveData() {
		this.updateSaveMode(null);
		let requests: ODataBatchCall[] = [];
		this.data.forEach((d, i) => {
			let payload: EightDReportFiveWhy = {
				question: d.question,
				answer: d.answer,
			};

			if (d.id) {
				let request = new ODataBatchCall(i, "patch", `/odata${this.baseUrl}/${d.id}`);
				request.body = payload;

				requests.push(request);
			} else if (this.isWhyFilledOut(d)) {
				payload.eight_d_report_id = this.eightDReportId;
				let request = new ODataBatchCall(i, "post", `/odata${this.baseUrl}`);
				request.body = payload;

				requests.push(request);
			}
		});

		await lastValueFrom(this.qualiVisuService.post("$batch", { requests }));
	}

	isWhyFilledOut(why: EightDReportFiveWhy) {
		return why.question || why.answer;
	}
}
