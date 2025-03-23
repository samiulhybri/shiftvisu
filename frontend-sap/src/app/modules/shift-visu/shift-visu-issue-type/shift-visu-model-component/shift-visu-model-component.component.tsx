import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

import React from "react";
import { Text } from "@ui5/webcomponents-react";

import { GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { ShiftVisuComponentOptionTypeClass } from "@app/shared/enums/ShiftVisuComponentTypeEnum";
import { AuthService } from "@app/shared/services/auth.service";
import { objectsDeepEqual } from "@app/shared/utils/compare-objects-deep";
import { BackendModelTypeClass } from "@app/shared/enums/BackendModelType";

import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";

@Component({
	selector: "app-shift-visu-model-component",
	templateUrl: "./shift-visu-model-component.component.html",
	styleUrl: "./shift-visu-model-component.component.css",
})
export class ShiftVisuModelComponentComponent implements OnChanges {
	@Input() issueType: any = null;

	shiftVisuAdminPermission = PermissionEnum.SHIFTVISU_ADMIN;

	selectedRowsId: any = [];
	initialSelectedRowsId: {} = [];
	idToIndex: any = [];

	filterQuery = `model_type ne null and model_type ne ''`;
	isOpenDataUnsaved: boolean = false;
	isLoading: unknown;
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
			Header: $localize`Model Type1`,
			accessor: "model_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				let model = BackendModelTypeClass.getStateTranslate(row.original.model_type);
				return (
					<React.StrictMode>
						<Text>{model?.text}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Mandatory`,
			accessor: "is_mandatory",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Checkbox,
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
						<Text>{text}</Text>
					</React.StrictMode>
				);
			},
		},
	];

	data: any[] = [];

	constructor(
		public authService: AuthService,
		private shiftVisuService: ShiftVisuService
	) {}

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

	rowClick(event: any) {
		let index = event.detail.row.index;
		this.data[index].selected = event.detail.selectedRowIds[index];
		this.selectedRowsId = event.detail.selectedRowIds;
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
}
