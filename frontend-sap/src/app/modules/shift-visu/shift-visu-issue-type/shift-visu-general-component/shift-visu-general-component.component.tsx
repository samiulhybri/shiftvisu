import { Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";

import { Text } from "@ui5/webcomponents-react";
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

@Component({
	selector: "app-shift-visu-general-component",
	templateUrl: "./shift-visu-general-component.component.html",
	styleUrl: "./shift-visu-general-component.component.css",
})
export class ShiftVisuGeneralComponentComponent implements OnChanges {
	@Input() issueType: any = null;

	@ViewChild("generalComponentRef", { static: false }) generalComponentGrid:
		| CustomReactGridTable
		| undefined;

	shiftVisuAdminPermission = PermissionEnum.SHIFTVISU_ADMIN;

	selectedRowsId: Record<any, any> = {};
	initialSelectedRowsId: {} = {};
	idToIndex: any = {};

	isOpenDataUnsaved: boolean = false;

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
						<Text title={text}>{text}</Text>
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

	processData(data: any[], recentData?: any[]) {
		this.data = data;

		if (this.generalComponentGrid) {
			this.generalComponentGrid.selectedRowsId = structuredClone(this.selectedRowsId);
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
		let index = event.detail.row.index;
		this.data[index].selected = event.detail.selectedRowIds[index];
		this.selectedRowsId = event.detail.selectedRowIds;
	}
}
