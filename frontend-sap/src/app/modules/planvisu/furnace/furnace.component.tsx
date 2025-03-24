import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { Machine } from "@app/shared/models/machine.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { CommonService } from "@app/shared/services/common.service";
import {
	AnalyticalTableColumnDefinition,
	Button,
	ComboBoxItem,
	FlexBox,
	Icon,
	InputDomRef,
	Label,
	MultiComboBox,
	MultiComboBoxDomRef,
	MultiComboBoxItem,
	Switch,
	Text,
	TextAlign,
	Ui5CustomEvent,
} from "@ui5/webcomponents-react";
import React from "react";
import { Input as ReactInput } from "@ui5/webcomponents-react";
import { ComboBox } from "@ui5/webcomponents-react";
import { ActivatedRoute, Router } from "@angular/router";
import { ProdLot } from "@app/shared/models/prod-lot.model";
import moment from "moment";
import { SettingComponent } from "@app/modules/planvisu/furnace/setting/setting.component";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { CalculationHeatTreatmentTypeClass } from "@app/shared/enums/CalculationHeatTreatmentType";
import { MultiComboBoxSelectionChangeEventDetail } from "@ui5/webcomponents/dist/MultiComboBox";
import { environment } from "@app/environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
	OfferPosProductType,
	OfferPosProductTypeClass,
} from "@app/shared/models/OfferPosProductType";
import { Material } from "@app/shared/models/material.model";
import { HweQuenchingMedium, HweQuenchingMediumClass } from "@app/shared/enums/HweQuenchingMedium";
import DateTimePicker from "@ui5/webcomponents/dist/DateTimePicker";
import { Localization } from "@app/shared/utils/common-localize";

@Component({
	selector: "app-furnace",
	templateUrl: "./furnace.component.html",
	styleUrl: "./furnace.component.css",
})
export class FurnaceComponent implements OnInit {
	public openCalDetails: boolean = false;
	public calculationId!: number;
	protected prodOrderPosOperation = ProdOrderPosOperation;
	protected isDialogOpen = false;
	protected isViewSettingsOpen = false;
	protected additionalFilterQuery = "";
	public prodLotCustomIdFilterValue = "";
	linkedOperationsData: any[] = [];
	showPlannedOrders: boolean | undefined;
	localization = Localization;
	showLockedOrders: boolean | undefined;
	protected columns: AnalyticalTableColumnDefinition[] | any[] = [
		{
			Header: $localize`Trip`,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: true,
			isPreSelected: true,
			width: 50,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox>
							<Icon name={rowData?.prodLot?.custom_id ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				);
			},
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;

					if (this.showPlannedOrders == undefined) {
						return true;
					}
					if (this.showPlannedOrders == false && !rowData.prodLot?.custom_id) {
						return true;
					}
					if (this.showPlannedOrders == true && rowData.prodLot?.custom_id) {
						return true;
					}
					return false;
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
						<Switch
							checked={this.showPlannedOrders == true ? true : false}
							onChange={event => {
								this.showPlannedOrders = event.target.checked;
								column.setFilter("ff");
								popoverRef.current.open = false;
							}}></Switch>
						<Button
							icon="decline"
							onClick={() => {
								this.showPlannedOrders = undefined;
								column.setFilter();
								popoverRef.current.open = false;
							}}></Button>
					</div>
				);
			},
		},
		{
			Header: $localize`Is Locked`,
			accessor: "prodOrderPos.prodOrder.isLocked",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isPreSelected: true,
			width: 80,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							<Icon name={this.isOperationLocked(rowData) ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				);
			},
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;

					if (this.showLockedOrders == undefined) {
						return true;
					}
					if (this.showLockedOrders == false && !this.isOperationLocked(rowData)) {
						return true;
					}
					if (this.showLockedOrders == true && this.isOperationLocked(rowData)) {
						return true;
					}
					return false;
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
						<Switch
							checked={this.showLockedOrders == true ? true : false}
							onChange={event => {
								this.showLockedOrders = event.target.checked;
								column.setFilter("ff");
								popoverRef.current.open = false;
							}}></Switch>
						<Button
							icon="decline"
							onClick={() => {
								this.showLockedOrders = undefined;
								column.setFilter();
								popoverRef.current.open = false;
							}}></Button>
					</div>
				);
			},
		},

		{
			Header: $localize`Furnace Trip`,
			accessor: "prodLot.custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 80,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;

					if (this.selectedProdLots.length == 0) {
						return true;
					}
					return this.selectedProdLots.includes(rowData?.prodLot?.custom_id);
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<MultiComboBox
						onSelectionChange={(event: any) => {
							this.selectedProdLots = event.detail.items.map(
								(item: any) => item.text
							);
							column.setFilter(this.selectedProdLots.length == 0 ? "" : "dd");
						}}>
						{this.prodLots.map((v: any) => (
							<MultiComboBoxItem
								text={v.custom_id}
								selected={this.selectedProdLots.includes(v.custom_id)}
							/>
						))}
					</MultiComboBox>
				);
			},
		},
		{
			Header: $localize`Temparature`,
			accessor: "prodLot.temperature",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: TextAlign.End,
			isPreSelected: true,
			width: 80,
		},
		{
			Header: $localize`Cooldown`,
			accessor: "prodLot.is_cooldown_needed",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: true,
			isPreSelected: true,
			width: 50,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox>
							<Icon
								name={rowData?.prodLot?.is_cooldown_needed ? "accept" : "decline"}
							/>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Dimension`,
			accessor: "prodLot.dimension",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: true,
			isPreSelected: true,
			width: 200,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<Text>
							{rowData.prodOrderPos?.calculation?.offerPos?.outer_diameter_final
								? (rowData.prodOrderPos?.calculation?.offerPos
										?.outer_diameter_final ?? "") +
									" / " +
									(rowData.prodOrderPos?.calculation?.offerPos
										?.inner_diameter_final ?? "") +
									" x " +
									(rowData.prodOrderPos?.calculation?.offerPos?.height_final ??
										"") +
									" mm"
								: ""}
						</Text>
					</React.StrictMode>
				);
			},
		},

		{
			Header: $localize`Order Number`,
			accessor: "prodOrderPos.prodOrder.custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: TextAlign.End,
			isPreSelected: true,
			width: 80,
		},
		{
			Header: $localize`Start Date`,
			accessor: "formatedDate",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: TextAlign.End,
			isPreSelected: true,
			width: 100,
		},
		{
			Header: $localize`End Date`,
			accessor: "end",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: TextAlign.End,
			isPreSelected: true,
			width: 100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const endDate = moment(rowData.end).format("MMM DD, yyyy");
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>{endDate}</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Prod. Date & Time`,
			accessor: "prodLot.formatedStartDate",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: TextAlign.End,
			isPreSelected: true,
			width: 160,
		},
		{
			Header: $localize`Duration`,
			accessor: "formatedDate2",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: TextAlign.End,
			isPreSelected: true,
			width: 100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const start = moment(rowData?.prodLot?.start);
				const end = moment(rowData?.prodLot?.end);
				const diff = moment.duration(end.diff(start));
				const duration = moment.utc(diff.asMilliseconds()).format("HH:mm");
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>{rowData?.prodLot?.start ? duration : "00:00"}</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Oven Group`,
			accessor: "machineGroup.name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 200,
		},
		{
			Header: $localize`Oven Number`,
			accessor: "prodLot.machine.custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: TextAlign.End,
			isPreSelected: true,
			width: 50,
		},
		{
			Header: $localize`Oven Name`,
			accessor: "prodLot.machine.name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 190,
		},
		{
			Header: $localize`Note`,
			accessor: "prodLot.note",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 190,
		},
		{
			Header: $localize`Operation Pos`,
			accessor: "pos",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			hAlign: TextAlign.End,
		},
		{
			Header: $localize`Operation`,
			accessor: "name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 220,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;

					if (this.selectedOperations.length == 0) {
						return true;
					}
					return this.selectedOperations.includes(rowData?.name);
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<MultiComboBox
						onSelectionChange={(event: any) => {
							this.selectedOperations = event.detail.items.map(
								(item: any) => item.text
							);
							column.setFilter(this.selectedOperations.length == 0 ? "" : "dd");
						}}>
						{this.gridTable?.data.map((v: any) => (
							<MultiComboBoxItem
								text={v.name}
								selected={this.selectedOperations.includes(v.name)}
							/>
						))}
					</MultiComboBox>
				);
			},
		},
		{
			Header: $localize`Product`,
			accessor: "prodOrderPos.item.name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 260,
		},
		{
			Header: $localize`Product Type`,
			accessor: "prodOrderPos.calculation.offerPos.product_type",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			isPreSelected: true,
			width: 130,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					if (this.selectedProductTypes.length == 0) {
						return true;
					}
					return this.selectedProductTypes.includes(
						OfferPosProductTypeClass.getStateTranslate(
							rowData?.prodOrderPos?.calculation?.offerPos?.item_name ?? ""
						)
					);
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<MultiComboBox
						onSelectionChange={(event: any) => {
							this.selectedProductTypes = event.detail.items.map(
								(item: any) => item.text
							);
							column.setFilter(this.selectedProductTypes.length == 0 ? "" : "ff");
						}}>
						{OfferPosProductTypeClass.getEnumArray().map((v: any) => (
							<MultiComboBoxItem
								text={v.text}
								selected={this.selectedProductTypes.includes(v.text)}
							/>
						))}
					</MultiComboBox>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							<Text>{rowData?.prodOrderPos?.calculation?.offerPos?.item_name}</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Quantity`,
			accessor: "prodOrderPos.quantity",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 20,
		},
		{
			Header: $localize`Material`,
			accessor: "prodOrderPos.calculation.offerPos.material.name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 110,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					if (this.selectedMaterials.length == 0) {
						return true;
					}
					return this.selectedMaterials.includes(
						rowData?.prodOrderPos?.calculation?.offerPos?.material?.name ?? ""
					);
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<MultiComboBox
						onSelectionChange={(event: any) => {
							this.selectedMaterials = event.detail.items.map(
								(item: any) => item.text
							);
							column.setFilter(this.selectedMaterials.length == 0 ? "" : "dd");
						}}>
						{this.materials.map((v: any) => (
							<MultiComboBoxItem
								text={v.name}
								selected={this.selectedMaterials.includes(v.name)}
							/>
						))}
					</MultiComboBox>
				);
			},
		},
		{
			Header: $localize`Material Type`,
			accessor: "prodOrderPos.calculation.offerPos.material.material_group_type",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 70,
		},
		{
			Header: $localize`Linked Orders`,
			accessor: "prodOrderPos.calculation.note_linked_operations",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 100,
		},
		{
			Header: $localize`Quenching Medium`,
			accessor: "prodOrderPos.calculation.operationPlan.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					const opPos =
						rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
							(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
						);
					if (this.selectedQuenchingMediums.length == 0) {
						return true;
					}
					return this.selectedQuenchingMediums.includes(
						HweQuenchingMediumClass.getStateTranslate(
							opPos && opPos.operationPlanPosHeatTreatments.length
								? opPos.operationPlanPosHeatTreatments[0].quenching_medium
								: ""
						)
					);
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<MultiComboBox
						onSelectionChange={(event: any) => {
							this.selectedQuenchingMediums = event.detail.items.map(
								(item: any) => item.text
							);
							column.setFilter(this.selectedQuenchingMediums.length == 0 ? "" : "dd");
						}}>
						{HweQuenchingMediumClass.getEnumArray().map((v: any) => (
							<MultiComboBoxItem
								text={v.text}
								selected={this.selectedQuenchingMediums.includes(v.text)}
							/>
						))}
					</MultiComboBox>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? HweQuenchingMediumClass.getStateTranslate(
											opPos.operationPlanPosHeatTreatments[0].quenching_medium
										)
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Hardness`,
			accessor: "prodOrderPos.calculation.operationPlan.id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					const opPos =
						rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
							(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
						);

					const data =
						opPos && opPos.operationPlanPosHeatTreatments.length
							? opPos.operationPlanPosHeatTreatments[0].hardness
							: "";
					if (
						(this.hardnessMin == "0" || !this.hardnessMin) &&
						(this.hardnessMax == "0" || !this.hardnessMax)
					) {
						return true;
					} else if (
						data &&
						parseInt(data) >= (this.hardnessMin ? parseInt(this.hardnessMin) : 0) &&
						parseInt(data) <= (this.hardnessMax ? parseInt(this.hardnessMax) : 0)
					) {
						return true;
					} else {
						return false;
					}
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div>
						<Label showColon>{$localize`Min`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							value={this.hardnessMin}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.hardnessMin = event.target.value;
								column.setFilter(
									(this.hardnessMin && this.hardnessMin != "0") ||
										(this.hardnessMax && this.hardnessMax != "0")
										? "dd"
										: ""
								);
							}}
							type="Number"></ReactInput>
						<Label showColon style={{ marginLeft: "5px" }}>{$localize`Max`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.hardnessMax = event.target.value;
								column.setFilter(
									(this.hardnessMin && this.hardnessMin != "0") ||
										(this.hardnessMax && this.hardnessMax != "0")
										? "dd"
										: ""
								);
							}}
							value={this.hardnessMax}
							type="Number"></ReactInput>
					</div>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? opPos.operationPlanPosHeatTreatments[0].hardness
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Temperature Min`,
			accessor: "prodOrderPos.calculation.operationPlan.rendom",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					const opPos =
						rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
							(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
						);

					const data =
						opPos && opPos.operationPlanPosHeatTreatments.length
							? opPos.operationPlanPosHeatTreatments[0].temperature_min
							: "";
					if (
						(this.temperatureMinMin == "0" || !this.temperatureMinMin) &&
						(this.temperatureMinMax == "0" || !this.temperatureMinMax)
					) {
						return true;
					} else if (
						data &&
						parseInt(data) >=
							(this.temperatureMinMin ? parseInt(this.temperatureMinMin) : 0) &&
						parseInt(data) <=
							(this.temperatureMinMax ? parseInt(this.temperatureMinMax) : 0)
					) {
						return true;
					} else {
						return false;
					}
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div>
						<Label showColon>{$localize`Min`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							value={this.temperatureMinMin}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.temperatureMinMin = event.target.value;
								column.setFilter(
									(this.temperatureMinMin && this.temperatureMinMin != "0") ||
										(this.temperatureMinMax && this.temperatureMinMax != "0")
										? "dd"
										: ""
								);
							}}
							type="Number"></ReactInput>
						<Label showColon style={{ marginLeft: "5px" }}>{$localize`Max`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.temperatureMinMax = event.target.value;
								column.setFilter(
									(this.temperatureMinMin && this.temperatureMinMin != "0") ||
										(this.temperatureMinMax && this.temperatureMinMax != "0")
										? "dd"
										: ""
								);
							}}
							value={this.temperatureMinMax}
							type="Number"></ReactInput>
					</div>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? opPos.operationPlanPosHeatTreatments[0].temperature_min
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Temperature Max`,
			accessor: "prodOrderPos.calculation.operationPlan.rendom2",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					const opPos =
						rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
							(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
						);

					const data =
						opPos && opPos.operationPlanPosHeatTreatments.length
							? opPos.operationPlanPosHeatTreatments[0].temperature_max
							: "";
					if (
						(this.temperatureMaxMin == "0" || !this.temperatureMaxMin) &&
						(this.temperatureMaxMax == "0" || !this.temperatureMaxMax)
					) {
						return true;
					} else if (
						data &&
						parseInt(data) >=
							(this.temperatureMaxMin ? parseInt(this.temperatureMaxMin) : 0) &&
						parseInt(data) <=
							(this.temperatureMaxMax ? parseInt(this.temperatureMaxMax) : 0)
					) {
						return true;
					} else {
						return false;
					}
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div>
						<Label showColon>{$localize`Min`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							value={this.temperatureMaxMin}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.temperatureMaxMin = event.target.value;
								column.setFilter(
									(this.temperatureMaxMin && this.temperatureMaxMin != "0") ||
										(this.temperatureMaxMax && this.temperatureMaxMax != "0")
										? "dd"
										: ""
								);
							}}
							type="Number"></ReactInput>
						<Label showColon style={{ marginLeft: "5px" }}>{$localize`Max`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.temperatureMaxMax = event.target.value;
								column.setFilter(
									(this.temperatureMaxMin && this.temperatureMaxMin != "0") ||
										(this.temperatureMaxMax && this.temperatureMaxMax != "0")
										? "dd"
										: ""
								);
							}}
							value={this.temperatureMaxMax}
							type="Number"></ReactInput>
					</div>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? opPos.operationPlanPosHeatTreatments[0].temperature_max
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Annealing Temperature`,
			accessor: "prodOrderPos.calculation.operationPlan.random3",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					const opPos =
						rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
							(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
						);

					const data =
						opPos && opPos.operationPlanPosHeatTreatments.length
							? opPos.operationPlanPosHeatTreatments[0].annealing_temperature
							: "";
					if (
						(this.annealingMin == "0" || !this.annealingMin) &&
						(this.annealingMax == "0" || !this.annealingMax)
					) {
						return true;
					} else if (
						data &&
						parseInt(data) >= (this.annealingMin ? parseInt(this.annealingMin) : 0) &&
						parseInt(data) <= (this.annealingMax ? parseInt(this.annealingMax) : 0)
					) {
						return true;
					} else {
						return false;
					}
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div>
						<Label showColon>{$localize`Min`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							value={this.annealingMin}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.annealingMin = event.target.value;
								column.setFilter(
									(this.annealingMin && this.annealingMin != "0") ||
										(this.annealingMax && this.annealingMax != "0")
										? "dd"
										: ""
								);
							}}
							type="Number"></ReactInput>
						<Label showColon style={{ marginLeft: "5px" }}>{$localize`Max`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.annealingMax = event.target.value;
								column.setFilter(
									(this.annealingMin && this.annealingMin != "0") ||
										(this.annealingMax && this.annealingMax != "0")
										? "dd"
										: ""
								);
							}}
							value={this.annealingMax}
							type="Number"></ReactInput>
					</div>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? opPos.operationPlanPosHeatTreatments[0].annealing_temperature
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Heating Time`,
			accessor: "prodOrderPos.calculation.operationPlan.random4",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					const opPos =
						rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
							(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
						);

					const data =
						opPos && opPos.operationPlanPosHeatTreatments.length
							? opPos.operationPlanPosHeatTreatments[0].heating_time
							: "";
					if (
						(this.heatingMin == "0" || !this.heatingMin) &&
						(this.heatingMax == "0" || !this.heatingMax)
					) {
						return true;
					} else if (
						data &&
						parseInt(data) >= (this.heatingMin ? parseInt(this.heatingMin) : 0) &&
						parseInt(data) <= (this.heatingMax ? parseInt(this.heatingMax) : 0)
					) {
						return true;
					} else {
						return false;
					}
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div>
						<Label showColon>{$localize`Min`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							value={this.heatingMin}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.heatingMin = event.target.value;
								column.setFilter(
									(this.heatingMin && this.heatingMin != "0") ||
										(this.heatingMax && this.heatingMax != "0")
										? "dd"
										: ""
								);
							}}
							type="Number"></ReactInput>
						<Label showColon style={{ marginLeft: "5px" }}>{$localize`Max`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.heatingMax = event.target.value;
								column.setFilter(
									(this.heatingMin && this.heatingMin != "0") ||
										(this.heatingMax && this.heatingMax != "0")
										? "dd"
										: ""
								);
							}}
							value={this.heatingMax}
							type="Number"></ReactInput>
					</div>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? opPos.operationPlanPosHeatTreatments[0].heating_time
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Holding Time`,
			accessor: "prodOrderPos.calculation.operationPlan.random5",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					const opPos =
						rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
							(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
						);

					const data =
						opPos && opPos.operationPlanPosHeatTreatments.length
							? opPos.operationPlanPosHeatTreatments[0].holding_time
							: "";
					if (
						(this.holdingMin == "0" || !this.holdingMin) &&
						(this.holdingMax == "0" || !this.holdingMax)
					) {
						return true;
					} else if (
						data &&
						parseInt(data) >= (this.holdingMin ? parseInt(this.holdingMin) : 0) &&
						parseInt(data) <= (this.holdingMax ? parseInt(this.holdingMax) : 0)
					) {
						return true;
					} else {
						return false;
					}
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div>
						<Label showColon>{$localize`Min`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							value={this.holdingMin}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.holdingMin = event.target.value;
								column.setFilter(
									(this.holdingMin && this.holdingMin != "0") ||
										(this.holdingMax && this.holdingMax != "0")
										? "dd"
										: ""
								);
							}}
							type="Number"></ReactInput>
						<Label showColon style={{ marginLeft: "5px" }}>{$localize`Max`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.holdingMax = event.target.value;
								column.setFilter(
									(this.holdingMin && this.holdingMin != "0") ||
										(this.holdingMax && this.holdingMax != "0")
										? "dd"
										: ""
								);
							}}
							value={this.holdingMax}
							type="Number"></ReactInput>
					</div>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? opPos.operationPlanPosHeatTreatments[0].holding_time
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Cooldown Rate`,
			accessor: "prodOrderPos.calculation.operationPlan.random6",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					const opPos =
						rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
							(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
						);

					const data =
						opPos && opPos.operationPlanPosHeatTreatments.length
							? opPos.operationPlanPosHeatTreatments[0].cooldown_rate
							: "";
					if (
						(this.coolMin == "0" || !this.coolMin) &&
						(this.coolMax == "0" || !this.coolMax)
					) {
						return true;
					} else if (
						data &&
						parseInt(data) >= (this.coolMin ? parseInt(this.coolMin) : 0) &&
						parseInt(data) <= (this.coolMax ? parseInt(this.coolMax) : 0)
					) {
						return true;
					} else {
						return false;
					}
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div>
						<Label showColon>{$localize`Min`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							value={this.coolMin}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.coolMin = event.target.value;
								column.setFilter(
									(this.coolMin && this.coolMin != "0") ||
										(this.coolMax && this.coolMax != "0")
										? "dd"
										: ""
								);
							}}
							type="Number"></ReactInput>
						<Label showColon style={{ marginLeft: "5px" }}>{$localize`Max`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.coolMax = event.target.value;
								column.setFilter(
									(this.coolMin && this.coolMin != "0") ||
										(this.coolMax && this.coolMax != "0")
										? "dd"
										: ""
								);
							}}
							value={this.coolMax}
							type="Number"></ReactInput>
					</div>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? opPos.operationPlanPosHeatTreatments[0].cooldown_rate
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Cross Section`,
			accessor: "prodOrderPos.calculation.operationPlan.random7",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					const rowData = row.original;
					const opPos =
						rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
							(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
						);

					const data =
						opPos && opPos.operationPlanPosHeatTreatments.length
							? opPos.operationPlanPosHeatTreatments[0].cross_section
							: "";
					if (
						(this.crossMin == "0" || !this.crossMin) &&
						(this.crossMax == "0" || !this.crossMax)
					) {
						return true;
					} else if (
						data &&
						parseInt(data) >= (this.crossMin ? parseInt(this.crossMin) : 0) &&
						parseInt(data) <= (this.crossMax ? parseInt(this.crossMax) : 0)
					) {
						return true;
					} else {
						return false;
					}
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				return (
					<div>
						<Label showColon>{$localize`Min`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							value={this.crossMin}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.crossMin = event.target.value;
								column.setFilter(
									(this.crossMin && this.crossMin != "0") ||
										(this.crossMax && this.crossMax != "0")
										? "dd"
										: ""
								);
							}}
							type="Number"></ReactInput>
						<Label showColon style={{ marginLeft: "5px" }}>{$localize`Max`}</Label>
						<ReactInput
							style={{
								width: "50px",
								marginLeft: "5px",
							}}
							onInput={(event: Ui5CustomEvent<InputDomRef>) => {
								this.crossMax = event.target.value;
								column.setFilter(
									(this.crossMin && this.crossMin != "0") ||
										(this.crossMax && this.crossMax != "0")
										? "dd"
										: ""
								);
							}}
							value={this.crossMax}
							type="Number"></ReactInput>
					</div>
				);
			},
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? opPos.operationPlanPosHeatTreatments[0].cross_section
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Internal Note`,
			accessor: "prodOrderPos.calculation.operationPlan.random8",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: TextAlign.Center,
			isSelected: false,
			isPreSelected: false,
			width: 100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;
				const opPos =
					rowData.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
						(opPos: any) => parseInt(opPos.pos) == parseInt(rowData.pos)
					);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>
								{opPos && opPos.operationPlanPosHeatTreatments.length
									? opPos.operationPlanPosHeatTreatments[0].internal_note
									: ""}
							</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Calculation Heat Treatments`,
			accessor: "prodOrderPos.calculation.heatTreatments",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 200,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original.prodOrderPos?.calculation?.heatTreatments;

				const data = rowData
					? rowData
							.map((a: any) =>
								CalculationHeatTreatmentTypeClass.getStateTranslate(a.type)
							)
							.join()
					: "";

				return (
					<React.StrictMode>
						<Text>{data}</Text>
					</React.StrictMode>
				);
			},
			filter: (rows: any) => {
				return rows.filter((row: any) => {
					return (
						row.original.prodOrderPos?.calculation?.heatTreatments
							? row.original.prodOrderPos?.calculation?.heatTreatments
									.map((item: any) =>
										CalculationHeatTreatmentTypeClass.getStateTranslate(
											item.type
										)
									)
									.join()
							: ""
					).includes(this.heatTreatmentSearchValue);
				});
			},
			Filter: ({ column, popoverRef }: any) => {
				const handleChange = (
					event: Ui5CustomEvent<
						MultiComboBoxDomRef,
						MultiComboBoxSelectionChangeEventDetail
					>
				) => {
					this.heatTreatmentSearchValue = event.detail.items.length
						? event.detail.items.map((item: any) => `${item.text}`).join()
						: "";

					column.setFilter(this.heatTreatmentSearchValue);
				};
				return (
					<MultiComboBox onSelectionChange={handleChange} style={{ width: "100%" }}>
						{this.heatTreatments.map((heatTreatment: any) => (
							<MultiComboBoxItem
								id={heatTreatment.value}
								text={heatTreatment.text}
								selected={this.heatTreatmentSearchValue.includes(
									heatTreatment.text
								)}></MultiComboBoxItem>
						))}
					</MultiComboBox>
				);
			},
		},

		{
			Header: $localize`Sample Numbers`,
			accessor: "prodOrderPos?.hweQsSamplesProdOrderPos",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 200,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original.prodOrderPos?.hweQsSamplesProdOrderPos;

				const data = rowData
					? rowData.map((a: any) => a.hweQsSample?.custom_id).join()
					: "";

				return (
					<React.StrictMode>
						<Text>{data}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Melt`,
			accessor: "prodOrderPos?.hweQsSamplesProdOrderPos.p",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 200,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const data =
					row.original.prodOrderPos?.prodOrderPosBomPos?.classifications?.find(
						(item: any) => item.attribute == "Z_SCHMELZE"
					)?.value_string || "";

				return (
					<React.StrictMode>
						<Text>{data}</Text>
					</React.StrictMode>
				);
			},
		},

		{
			Header: $localize`Calculation details`,
			accessor: "...",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 120,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original.prodOrderPos.calculation;

				return (
					<React.StrictMode>
						<FlexBox>
							{rowData?.id ? (
								<Button
									id="informationButton"
									onClick={() => this.calculationDetails(rowData?.id)}
									icon="information"
								/>
							) : (
								<></>
							)}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Information`,
			accessor: ".....",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isPreSelected: true,
			width: 120,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							{
								<Button
									id="information2Button"
									onClick={() => this.clickOnOperation(rowData)}
									icon="information"
								/>
							}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];
	protected machines: Machine[] = [];
	protected machineGroups: MachineGroup[] = [];
	protected prodLotCustomId: string = "";
	protected selectedPosOrders: ProdOrderPosOperation[] = [];
	protected selectedDateTime = "";
	protected selectedDateTimeValue = "";
	protected selectedMachineId = 0;
	protected errorMessage = "";
	protected isDialogBusy = false;
	protected expandedQuery = "";
	protected tripData: ProdLot[] = [];
	protected isNewTrip = true;
	protected existingProdLotId = "";
	protected hallId = "";
	protected isBusy = false;
	protected showClearTripDialog: boolean = false;
	protected hours: number[] = [];
	protected minutes: number[] = [];
	protected selectedHour = "00";
	protected selectedMinute = "00";
	protected temperature = "0";
	protected isCooldownNeeded = false;
	protected selectedProductTypes: string[] = [];
	protected segmentButtonItems = [
		{
			id: "open",
			name: $localize`Open`,
		},
		{
			id: "closed",
			name: $localize`Closed`,
		},
	];
	heatTreatments = CalculationHeatTreatmentTypeClass.getEnumArray();

	protected note = "";

	protected showOpenOrders = true;
	protected materials: Material[] = [];
	protected selectedMaterials: Material[] = [];
	heatTreatmentSearchValue = "";
	hardnessMin = "0";
	hardnessMax = "0";
	temperatureMinMin = "0";
	temperatureMinMax = "0";
	temperatureMaxMin = "0";
	temperatureMaxMax = "0";
	annealingMin = "0";
	annealingMax = "0";
	holdingMin = "0";
	holdingMax = "0";
	heatingMin = "0";
	heatingMax = "0";
	crossMin = "0";
	crossMax = "0";
	coolMin = "0";
	coolMax = "0";
	selectedQuenchingMediums: string[] = [];
	prodLots: ProdLot[] = [];
	selectedProdLots: string[] = [];
	selectedOperations: string[] = [];

	@ViewChild("childComponentRef") gridTable?: CustomReactGridTable;
	@ViewChild("tripDialog") tripDialog?: any;
	@ViewChild("ovenCombobox") ovenCombobox?: any;
	@ViewChild("settingsDialog") settingsDialog?: SettingComponent;
	@ViewChild("startDate") startDate?: DateTimePicker;

	constructor(
		private commonService: CommonService,
		private route: ActivatedRoute,
		private router: Router,
		private http: HttpClient
	) {}

	ngOnInit(): void {
		this.hallId = this.route.snapshot.params["id"];
		this.resetAll();
		this.route.params.subscribe(params => {
			this.hallId = params["id"];
			this.resetAll();
			setTimeout(() => {
				this.gridTable?.onFilterAndSorting();
			}, 500);
		});
	}

	resetAll() {
		this.getMaterials();
		this.getProdLots();
		this.setLinkedOperations();
		this.setColumns();
		this.getMachines();
		this.getMachineGroups();
		this.expandedQuery = `&$expand=prodLot(expand=machine($expand=machineGroup)),prodOrderPos(expand=hweQsSamplesProdOrderPos(expand=hweQsSample),prodOrderPosBomPos($expand=classifications),bomPos($expand=item,unitOfMeasure,classifications),prodOrder,item,calculation(expand=testingScope,heatTreatments,operationPlan($expand=operationPlanPos($expand=operationPlanPosHeatTreatments)),offerPos($expand=offerPosRawDimensions,material,offer($expand=customer)))),machineGroup()&$filter=machineGroup/any(a:a/hall_id eq ${this.hallId} and a/custom_id ne '484') and status ne '${ProdOrderPosOperationStatus.CLOSED}' and pos ne '0390'`;
		this.resetProdLots();
		this.resetCustomId();
		this.setHourAndMinute();
	}

	getProdLots() {
		this.commonService.get("ProdLots").subscribe({
			next: (data: any) => {
				this.prodLots = data.value.map((v: any) => new ProdLot().deserialize(v));
			},
		});
	}

	getMaterials() {
		this.commonService.get("Materials").subscribe({
			next: (data: any) => {
				this.materials = data.value.map((v: any) => new Material().deserialize(v));
			},
		});
	}

	setLinkedOperations() {
		const token = localStorage.getItem("token");
		const homeLink = environment.homeLink;
		if (token) {
			const headers = new HttpHeaders({
				Authorization: `Bearer ${token}`,
			});
			this.http
				.get(
					homeLink +
						"mes_visu/ruesten/php/mes_visu_data_services.php?service=get_lock_orders_info",
					{ headers: headers }
				)
				.subscribe({
					next: (res: any) => {
						this.linkedOperationsData = res;
						this.gridTable?.render();
					},
				});
		}
	}

	isOperationLocked(prodOrderPosOperation: ProdOrderPosOperation): boolean {
		let isLocked = false;
		this.linkedOperationsData.forEach((data: any) => {
			data.oparations.forEach((element: any) => {
				if (
					element.auf_nr ==
					`${prodOrderPosOperation.prodOrderPos?.prodOrder?.custom_id}|${prodOrderPosOperation.pos}`
				) {
					if (element.show == 1) {
						isLocked = false;
					} else {
						isLocked = true;
					}
				}
			});
		});

		return isLocked;
	}
	setColumns() {
		let columns: any = localStorage.getItem("furnaceTrip");
		if (!columns) return;

		columns = JSON.parse(columns);

		if (columns.length != this.columns.length) {
			localStorage.removeItem("furnaceTrip");
			return;
		}
		const newColumns: any[] = [];
		columns.forEach((column: any) => {
			const data = this.columns.find((clm: any) => column.accessor == clm.accessor);
			if (data) {
				data.isSelected = column.isSelected;
			}
			newColumns.push(data);
		});

		this.columns = newColumns;
	}

	getMachines() {
		this.commonService
			.get(`Machines?$filter=hall_id eq ${this.hallId}`)
			.subscribe((data: any) => {
				this.machines = data.value.map((machine: any) =>
					new Machine().deserialize(machine)
				);
			});
	}

	getMachineGroups() {
		this.commonService
			.get(`MachineGroups?$filter=hall_id eq ${this.hallId}`)
			.subscribe((data: any) => {
				this.machineGroups = data.value.map((machineGroup: any) =>
					new MachineGroup().deserialize(machineGroup)
				);
			});
	}

	protected resetProdLots() {
		this.commonService
			.get(`ProdLots?expand=machine() & $filter=machine/any(a:a/hall_id eq ${this.hallId})`)
			.subscribe((data: any) => {
				this.tripData = data.value.map((lot: any) => new ProdLot().deserialize(lot));
			});
	}

	protected resetCustomId() {
		this.commonService.get("generateId?entity=ProdLot", false).subscribe((data: any) => {
			this.prodLotCustomId = data.entity;
		});
	}

	protected closeDialog() {
		this.isDialogOpen = false;
		this.isNewTrip = true;
		this.errorMessage = "";
		this.selectedDateTime = "";
		this.selectedHour = "00";
		this.selectedMinute = "00";
		this.ovenCombobox.elementRef.nativeElement.value = "";
		this.existingProdLotId = "";
		this.note = "";
		this.temperature = "0";
		this.isCooldownNeeded = false;
		this.resetCustomId();
	}

	protected closeClearTripDialog() {
		this.showClearTripDialog = false;
	}

	protected handleNewButtonClick() {
		this.isDialogOpen = true;
		this.errorMessage = "";
	}

	protected download() {
		this.isBusy = true;
		const query = this.gridTable?.data
			.map((prodOrderPosOperation: any) => `&operations[]=${prodOrderPosOperation.id}`)
			.join("");
		this.commonService
			.getFile(`plan_visu/get_furnace_trip_pdf/${this.hallId}?${query}`, false)
			.subscribe({
				next: async (response: any) => {
					const blob = new Blob([response], { type: "application/pdf" });
					let printWindow = window.open(window.URL.createObjectURL(blob));
					printWindow?.document.close();
					printWindow?.focus();
					this.isBusy = false;
				},
				error: (e: any) => {
					this.isBusy = false;
				},
			});
	}

	protected rowClick(e: Event) {
		this.selectedPosOrders = (e as any).detail.selectedFlatRows.map((row: any) => row.original);
	}

	protected save() {
		if (this.selectedPosOrders.length == 0) {
			this.errorMessage = $localize`Please select an Operation`;
			return;
		}

		if (!this.selectedMachineId) {
			this.errorMessage = $localize`Please select a Machine`;
			return;
		}

		if (!this.selectedDateTime) {
			this.errorMessage = $localize`Please select the time`;
			return;
		}

		this.isDialogBusy = true;

		if (this.isNewTrip) {
			this.commonService
				.post("ProdLots", {
					machine_id: this.selectedMachineId,
					custom_id: this.prodLotCustomId,
					start: moment.utc(this.startDate?.dateValue).format("YYYY-MM-DD HH:mm:ss"),
					end: moment
						.utc(this.startDate?.dateValue)
						.add(
							this.timeToDecimal(`${this.selectedHour}:${this.selectedMinute}`),
							"seconds"
						)
						.format("YYYY-MM-DD HH:mm:ss"),
					note: this.note,
					temperature: this.temperature,
					is_cooldown_needed: this.isCooldownNeeded ?? false,
				})
				.subscribe(
					(data: any) => {
						this.updateProdOrderOperation(data);
						this.resetProdLots();
					},
					err => {
						console.error(err);
						this.resetProdLots();
					}
				);
		} else {
			this.commonService
				.put(`ProdLots/${this.existingProdLotId}`, {
					machine_id: this.selectedMachineId,
					custom_id: this.prodLotCustomId,
					start: moment.utc(this.startDate?.dateValue).format("YYYY-MM-DD HH:mm:ss"),
					end: moment
						.utc(this.startDate?.dateValue)
						.add(
							this.timeToDecimal(`${this.selectedHour}:${this.selectedMinute}`),
							"seconds"
						)
						.format("YYYY-MM-DD HH:mm:ss"),
					note: this.note,
					is_cooldown_needed: this.isCooldownNeeded,
					temperature: this.temperature,
				})
				.subscribe(
					(data: any) => {
						this.updateProdOrderOperation(data);
					},
					err => {
						console.error(err);
					}
				);

			this.isNewTrip = true;
		}
	}

	timeToDecimal(t: string) {
		if (!t) return 0;
		let a = t.split(":");
		let seconds = +a[0] * 60 * 60 + +a[1] * 60;
		return seconds;
	}

	updateProdOrderOperation(data?: any) {
		let requests: ODataBatchCall[] = [];
		for (let prodOrderPosOperation of this.selectedPosOrders) {
			const payload: any = prodOrderPosOperation.toOdata(false);
			payload.prod_lot_id = data?.id ?? null;
			payload.start = data?.start ?? payload.erp_start;
			payload.end = data?.end ?? payload.erp_end;
			payload.status = data?.id ? ProdOrderPosOperationStatus.PLANNED : "";
			payload.machine_id = data?.machine_id ?? null;
			payload.plan_machine_id = data?.machine_id ?? null;

			let requestData = new ODataBatchCall(
				1,
				"put",
				`\/odata\/ProdOrderPosOperations\/${prodOrderPosOperation.id}`
			);

			requestData.body = payload;
			requests.push(requestData);
		}

		this.commonService.post(`$batch`, { requests }).subscribe({
			next: (res: any) => {
				this.closeDialog();
				this.setLinkedOperations();
				this.gridTable?.onFilterAndSorting("", "", "Contain");
				this.isDialogBusy = false;
				this.resetCustomId();
			},
			error: (e: any) => {
				this.errorMessage = $localize`Data is not saved. error: ${e.message}`;
				this.isDialogBusy = false;
				this.resetCustomId();
			},
		});
	}

	getFilterInput(field: string, filterType = "Contain", column: any) {
		let value = "";
		return (
			<ReactInput
				onInput={function _a(event: any) {
					value = event.target.typedInValue;
					column.setFilter(event.target.typedInValue);
				}}
				onChange={e => {
					this.gridTable?.onFilterAndSorting(field, value, filterType);
				}}
				onKeyDown={e => {
					if (e.code == "Enter")
						this.gridTable?.onFilterAndSorting(field, value, filterType);
				}}></ReactInput>
		);
	}

	protected changeMachine(e: Event) {
		this.selectedMachineId = parseInt((e as any).detail.item.id);
	}

	protected tripChange(event: any) {
		if (!event.detail.selectedItems[0]) return;
		this.isNewTrip = false;
		const trip = this.tripData.find(
			trip => trip.custom_id == event.detail.selectedItems[0].innerText
		);
		this.prodLotCustomId = trip?.custom_id!;
		this.selectedDateTime = moment(trip?.start!, "")
			.locale(localStorage.getItem("CurrentLanguage")!)
			.format("MMM DD, yyyy  hh:mm a");

		/**
		 * HH:MM calculation
		 */
		const start = moment.utc(trip?.start);
		const end = moment.utc(trip?.end);
		const duration = moment.duration(end.diff(start)).asHours().toString();
		const splittedDuration = duration.split(".");
		splittedDuration[1] = `${(parseFloat(splittedDuration[1]) * 6).toString()[0]}${
			(parseFloat(splittedDuration[1]) * 6).toString()[1]
		}`;

		this.selectedHour = splittedDuration[0].padStart(2, "0") ?? "00";
		this.selectedMinute = splittedDuration[1].padStart(2, "0") ?? "00";

		this.selectedMachineId = trip?.machine_id!;
		this.ovenCombobox.elementRef.nativeElement.value = trip?.machine?.name;
		this.existingProdLotId = trip?.id!.toString() ?? "";
		this.isCooldownNeeded = trip?.is_cooldown_needed ?? false;
		this.temperature = trip?.temperature?.toString() ?? "0";
		this.note = trip?.note ?? "";
	}

	settingsDialogSave(event: any[]) {
		this.gridTable!.columns = event;
		this.gridTable!.render();
	}

	protected onClickSettingsButton() {
		this.settingsDialog?.openDialog();
	}

	protected clearButtonClick() {
		this.showClearTripDialog = true;
	}

	protected saveCreatTripButton() {
		this.updateProdOrderOperation();
		this.showClearTripDialog = false;
	}

	setHourAndMinute() {
		this.hours = [];
		this.minutes = [];

		for (let i = 0; i < 101; i++) {
			this.hours.push(i);
		}
		for (let i = 0; i < 61; i++) {
			this.minutes.push(i);
		}
	}

	segmentButtonChange(event: any) {
		this.showOpenOrders = event.detail.selectedItems[0].id == "open";
		if (event.detail.selectedItems[0].id == "open") {
			this.expandedQuery = `&$expand=prodLot(expand=machine($expand=machineGroup)),prodOrderPos(expand=hweQsSamplesProdOrderPos(expand=hweQsSample),prodOrderPosBomPos($expand=classifications),bomPos($expand=item,unitOfMeasure,classifications),prodOrder,item,calculation(expand=operationPlan($expand=operationPlanPos($expand=operationPlanPosHeatTreatments)),offerPos($expand=offerPosRawDimensions,material))),machineGroup()&$filter=machineGroup/any(a:a/hall_id eq ${this.hallId} and a/custom_id ne '484') and status ne '${ProdOrderPosOperationStatus.CLOSED}' and pos ne '0390'`;
		} else {
			this.expandedQuery = `&$expand=prodLot(expand=machine($expand=machineGroup)),prodOrderPos(expand=hweQsSamplesProdOrderPos(expand=hweQsSample),prodOrderPosBomPos($expand=classifications),bomPos($expand=item,unitOfMeasure,classifications) ,prodOrder,item,calculation(expand=operationPlan($expand=operationPlanPos($expand=operationPlanPosHeatTreatments)),offerPos($expand=offerPosRawDimensions,material))),machineGroup()&$filter=machineGroup/any(a:a/hall_id eq ${this.hallId} and a/custom_id ne '484') and status eq '${ProdOrderPosOperationStatus.CLOSED}' and pos ne '0390'`;
		}
		this.gridTable!.skip = 0;
		setTimeout(() => {
			this.gridTable?.onPagination(true);
		});
	}

	onColumnsReorder(event: any) {
		const newColumnList = event.detail.columnsNewOrder.splice(2, 15);
		localStorage.setItem(
			"furnaceTrip",
			JSON.stringify(
				newColumnList.map((column: any) => {
					const currentColumn = this.columns.find(
						(column2: any) => column2.accessor == column.id
					);
					return { accessor: column.id, isSelected: currentColumn.isSelected };
				})
			)
		);
	}

	calculationDetails(calculationId?: number) {
		this.openCalDetails = true;
		if (calculationId) this.calculationId = calculationId;
	}
	closeHweDialog(isOff: boolean) {
		this.openCalDetails = false;
	}

	clickOnOperation(prodOrderPosOperation: ProdOrderPosOperation): void {
		this.router.navigate([`operation/${prodOrderPosOperation.id}`], {
			relativeTo: this.route,
			state: { operation: JSON.stringify(prodOrderPosOperation) },
		});
	}

	changeCooldown(event: any) {
		this.isCooldownNeeded = event.target.checked;
	}
}
