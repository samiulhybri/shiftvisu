import {
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges,
	ViewChild,
} from "@angular/core";

import { CheckBox, Text } from "@ui5/webcomponents-react";
import React from "react";

import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { AuthService } from "@app/shared/services/auth.service";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { objectsDeepEqual } from "@app/shared/utils/compare-objects-deep";
import { ShiftVisuComponentOptionTypeClass } from "@app/shared/enums/ShiftVisuComponentTypeEnum";

import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";
import { ShiftVisuComponentModel } from "@app/shared/models/shift-visu-component.model";

@Component({
	selector: "app-shift-visu-general-component",
	templateUrl: "./shift-visu-general-component.component.html",
	styleUrl: "./shift-visu-general-component.component.css",
})
export class ShiftVisuGeneralComponentComponent implements OnChanges, OnInit {
	@Input() issueType: any = null;
	@Input() selectedIssue = new EventEmitter<any>();

	@ViewChild("generalComponentRef", { static: false }) gridTable:
		| CustomReactGridTable
		| undefined;

	shiftVisuAdminPermission = PermissionEnum.SHIFTVISU_ADMIN;
	selectedOriginalData: any[] = [];
	selectedRowsId: Record<any, any> = {};
	initialSelectedRowsId: {} = {};
	idToIndex: any = {};
	selectedRowIds: any = {};
	isOpenDataUnsaved: boolean = false;
	generalComponents: ShiftVisuComponentModel[] = [];
	filterQuery = `model_type eq null or model_type eq ''`;

	columns: any = [
		{
			Header: $localize`Name`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Mandatory`,
			accessor: "is_mandatory",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			// dataType: GridTableColumnDataType.Checkbox,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<CheckBox
							checked={!row.isSelected ? false : true}
							indeterminate={false}
							disabled={row.isSelected ? false : true}
							onClick={event => {
								this.onCheckMandatory(event, row);
							}}
						/>
					</React.StrictMode>
				);
			},
		},

		{
			Header: $localize`Component Type`,
			accessor: "component_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				let text = ShiftVisuComponentOptionTypeClass.getStateTranslate(
					row.original.component_type
				);
				return (
					<React.StrictMode>
						<Text title={text}>{text}</Text>
					</React.StrictMode>
				);
			},
		},
	];

	data: any[] = [];

	constructor(
		public authService: AuthService,
		private shiftVisuService: ShiftVisuService,
		private cdr: ChangeDetectorRef
	) {}
	ngOnInit(): void {
		this.selectedIssue.subscribe((issue: any) => {
			this.generalComponents =
			this.generalComponents = issue.components?.filter((component: any) => component.model_type === null) || [];

			if (this.gridTable?.data?.length) {
				this.selectedRowIds = {}; // Reset selection
				const modelComponentIds = this.generalComponents.map((comp: any) => comp.id);
				// Loop through gridTable data and check for matching IDs
				this.gridTable.data.forEach((item: any, index: number) => {
					if (modelComponentIds.includes(item.id)) {
						this.selectedRowIds[index] = true;
					}
				});

				this.gridTable.selectedRowsId = structuredClone(this.selectedRowIds);
				this.gridTable.render();
				console.log("Selected Row IDs:", this.selectedRowIds);
				console.log("Grid Table Data:", this.gridTable.selectedRowsId);
				this.cdr.detectChanges();
			}
		});
	}

	processData(data: any[], recentData?: any[]) {
		if (this.gridTable?.data?.length) {
			this.selectedRowIds = {}; // Reset selection

			// Get all model component IDs
			const modelComponentIds = this.generalComponents.map((comp: any) => comp.id);

			// Loop through gridTable data and check for matching IDs
			this.gridTable.data.forEach((item: any, index: number) => {
				if (modelComponentIds.includes(item.id)) {
					this.selectedRowIds[index] = true;
				}
			});

			this.gridTable.selectedRowsId = { ...this.selectedRowIds };
			this.gridTable.render();
			console.log("Selected Row IDs:", this.selectedRowIds);
			console.log("Grid Table Data:", this.gridTable.selectedRowsId);
			this.cdr.detectChanges();
		}
	}
	onCheckMandatory(event: any, selectRow: any) {
		event.stopPropagation(); // Prevents unwanted event bubbling

		const isChecked = event.target.checked;
		console.log(`Checkbox clicked. Checked: ${isChecked}`);
		console.log("onCheckMandatory called for row:", selectRow);
		const row = selectRow.original;
		const rowIndex = this.selectedOriginalData.findIndex(item => item.id === row.id);
		if (rowIndex !== -1) {
			this.selectedOriginalData[rowIndex].is_mandatory = isChecked;
			console.log("Updated row with id_mandatory:", this.selectedOriginalData[rowIndex]);
		} else {
			console.log("Row not found in selectedOriginalData");
		}
	}
	ngOnChanges(changes: SimpleChanges): void {
		if (changes["failure"]?.currentValue) {
			this.initializeDataOnChange(changes["failure"].currentValue);
		}
	}

	initializeDataOnChange(currentFailure: any) {
		let selectedFailure = currentFailure;

		/**
		 * ToDo: Call backend when required properties are added.
		 */
	}

	returnIdForUnsavedFailure() {
		if (this.issueType && !objectsDeepEqual(this.selectedRowsId, this.initialSelectedRowsId)) {
			this.isOpenDataUnsaved = true;
			return this.issueType.id;
		} else {
			return null;
		}
	}

	closeDataUnSavedDialog() {
		this.isOpenDataUnsaved = false;
	}

	/**
	 * ToDo: Add saving functionality
	 * */
	saveUnSavedData() {
		this.isOpenDataUnsaved = false;
	}

	rowClick(event: any) {
		const selectedOriginalData = event.detail.selectedFlatRows.map(
			(row: { original: any }) => row.original
		);
		this.selectedOriginalData = selectedOriginalData.map((row: any) => {
			row.is_mandatory = row.is_mandatory = true;
			return row;
		});
		console.log("Selected Original Data:", this.selectedOriginalData);
	}
}
