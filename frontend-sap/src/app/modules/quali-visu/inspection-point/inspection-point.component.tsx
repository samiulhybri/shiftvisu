import { Component } from "@angular/core";
import { GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { FlexBox } from "@ui5/webcomponents-react";
import React from "react";

@Component({
	selector: "app-inspection-point",
	templateUrl: "./inspection-point.component.html",
	styleUrl: "./inspection-point.component.css",
})
export class InspectionPointComponent {
	localization = Localization;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {}

	columns: any = [
		{
			Header: $localize`Machine`,
			accessor: "machine.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			minWidth: 50,
		},
		{
			Header: $localize`Item`,
			accessor: "prodOrderPosOperation.prodOrderPos.item.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			minWidth: 50,
		},
		{
			Header: $localize`Order`,
			accessor: "prodOrderPosOperation.prodOrderPos.prodOrder.custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
		},
		{
			Header: $localize`Operation`,
			accessor: "prodOrderPosOperation.pos",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
		},
		{
			Header: $localize`Date Opened`,
			accessor: "date_opened",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Date,
			hAlign: "End",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const [year, month, date] = rowData.date_opened?.split("T")?.[0]?.split("-");

				return (
					<React.StrictMode>
						<FlexBox>
							{date || 0}.{month || 0}.{year || 0}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];
}
