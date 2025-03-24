import { Injectable } from "@angular/core";
import {
	CrmActionLog,
	ResposibleGrid,
	ActionGrid,
	CountryGrid,
	MarketSegments,
} from "@app/modules/crm/interfaces/action-report";
import { ChartRangeList } from "@app/shared/interfaces/chart-range-list";
import { FlexBox, FlexBoxDirection, Text } from "@ui5/webcomponents-react";
import React from "react";
import { BehaviorSubject } from "rxjs";
import { ActionReportGridName } from "../enums/actionReportGrid";

@Injectable({
	providedIn: "root",
})
export class ActionReportService {
	// TODO:: Horizontal Bar chart Events

	/**
	 * Subject to manage click events on the horizontal bar chart.
	 * Emits the selected category or null when reset.
	 */
	private chartClickEventSubject = new BehaviorSubject<string | null>(null);

	/**
	 * Observable to track chart click events.
	 * Components can subscribe to get the selected category.
	 */
	chartClickEvent$ = this.chartClickEventSubject.asObservable();

	/**
	 * Subject to determine whether the date range bar chart should be filtered.
	 * Default value: true (filter is applied).
	 */
	private dateRangeBarChartFilterSubject = new BehaviorSubject<boolean>(true);

	/**
	 * Observable to track filtering status of the date range bar chart.
	 */
	dateRangeBarChartFilter$ = this.dateRangeBarChartFilterSubject.asObservable();

	/**
	 * Updates the clicked category of the horizontal bar chart.
	 * If the same category is clicked twice, it resets the selection.
	 *
	 * @param category - The clicked category name or null to reset.
	 */
	updateChartClickEvent(category: string[] | null): void {
		const currentFilterValue = this.chartClickEventSubject.value;

		// If category is null, reset the filter
		if (category === null) {
			this.chartClickEventSubject.next("");
			this.dateRangeBarChartFilterSubject.next(true);
			return;
		}

		// Check if category array exists and if it matches the current filter value
		if (category.length > 0 && currentFilterValue === category.join(",")) {
			// If the same category is clicked, reset the filter
			this.chartClickEventSubject.next("");
			this.dateRangeBarChartFilterSubject.next(true);
		} else {
			// Set the new category value and disable filter
			if (category.length > 0) {
				this.chartClickEventSubject.next(category.join(","));
				this.dateRangeBarChartFilterSubject.next(false);
			} else {
				this.chartClickEventSubject.next("");
				this.dateRangeBarChartFilterSubject.next(true);
			}
		}
	}
	// TODO:: Vertical Bar chart Events

	/**
	 * Subject to manage click events on the vertical bar chart.
	 * Emits the selected segment or null when reset.
	 */
	private verticalChartClickEventSubject = new BehaviorSubject<string[] | null>(null);

	/**
	 * Observable to track click events on the vertical bar chart.
	 */
	verticalChartClickEvent$ = this.verticalChartClickEventSubject.asObservable();

	/**
	 * Subject to determine whether the segment bar chart should be filtered.
	 * Default value: true (filter is applied).
	 */
	private segmentBarChartFilterSubject = new BehaviorSubject<boolean>(true);

	/**
	 * Observable to track filtering status of the segment bar chart.
	 */
	segmentBarChartFilter$ = this.segmentBarChartFilterSubject.asObservable();

	/**
	 * Updates the clicked segment of the vertical bar chart.
	 * If the same segment is clicked twice, it resets the selection.
	 *
	 * @param segment - The clicked segment name or null to reset.
	 */
	updateSegmentBarChartEvent(segment: string[] | null): void {
		const currentFilterValue = this.verticalChartClickEventSubject.value || []; // Ensure it's always an array

		// If segment is null, reset the filter
		if (segment === null) {
			this.verticalChartClickEventSubject.next([]);
			this.segmentBarChartFilterSubject.next(true);
			return;
		}

		// Check if segment array exists and if it matches the current filter value
		if (segment.length > 0 && this.areArraysEqual(currentFilterValue, segment)) {
			// If the same segment is clicked, reset the filter
			this.verticalChartClickEventSubject.next([]);
			this.segmentBarChartFilterSubject.next(true);
		} else {
			// Set the new segment value and disable filter
			if (segment.length > 0) {
				this.verticalChartClickEventSubject.next(segment);
				this.segmentBarChartFilterSubject.next(false);
			} else {
				this.verticalChartClickEventSubject.next([]);
				this.segmentBarChartFilterSubject.next(true);
			}
		}
	}

	// TODO:: Selection Management

	/**
	 * Subject to manage selected actions in a grid.
	 * Emits an array of selected action IDs.
	 */
	private selectedActionsSubject = new BehaviorSubject<number[]>([]);

	/**
	 * Observable for selected actions.
	 */
	selectionActions$ = this.selectedActionsSubject.asObservable();

	/**
	 * Subject to manage selected users in a grid.
	 * Emits an array of selected user IDs.
	 */
	private selectedUsersSubject = new BehaviorSubject<number[]>([]);

	/**
	 * Observable for selected users.
	 */
	selectionUsers$ = this.selectedUsersSubject.asObservable();

	/**
	 * Subject to manage selected countries in a grid.
	 * Emits an array of selected country IDs.
	 */
	private selectedCountriesSubject = new BehaviorSubject<number[]>([]);

	/**
	 * Observable for selected countries.
	 */
	selectionCountries$ = this.selectedCountriesSubject.asObservable();

	// TODO:: Grid Filter Management

	/**
	 * Subject to track filtering status of the action grid.
	 * Default value: true (filter is applied).
	 */
	private actionGridFilterSelectionSubject = new BehaviorSubject<boolean>(true);

	/**
	 * Observable to track filtering status of the action grid.
	 */
	actionGridFilter$ = this.actionGridFilterSelectionSubject.asObservable();

	/**
	 * Subject to track filtering status of the user grid.
	 * Default value: true (filter is applied).
	 */
	private userGridFilterSelectionSubject = new BehaviorSubject<boolean>(true);

	/**
	 * Observable to track filtering status of the user grid.
	 */
	userGridFilter$ = this.userGridFilterSelectionSubject.asObservable();

	/**
	 * Subject to track filtering status of the country grid.
	 * Default value: true (filter is applied).
	 */
	private countryGridFilterSelectionSubject = new BehaviorSubject<boolean>(true);

	/**
	 * Observable to track filtering status of the country grid.
	 */
	countryGridFilter$ = this.countryGridFilterSelectionSubject.asObservable();

	/**
	 * Updates the selected actions and manages the filtering state.
	 *
	 * @param actions - Array of selected action IDs.
	 */
	updateSelectedActions(actions: number[]): void {
		this.selectedActionsSubject.next(actions);
		// Set filtering state based on whether actions are selected
		this.actionGridFilterSelectionSubject.next(actions.length === 0);
	}

	/**
	 * Updates the selected users and manages the filtering state.
	 *
	 * @param users - Array of selected user IDs.
	 */
	updateSelectedUsers(users: number[]): void {
		this.selectedUsersSubject.next(users);
		// Set filtering state based on whether users are selected
		this.userGridFilterSelectionSubject.next(users.length === 0);
	}

	/**
	 * Updates the selected countries and manages the filtering state.
	 *
	 * @param countries - Array of selected country IDs.
	 */
	updateSelectedCountries(countries: number[]): void {
		this.selectedCountriesSubject.next(countries);
		// Set filtering state based on whether countries are selected
		this.countryGridFilterSelectionSubject.next(countries.length === 0);
	}

	private calculateGridData<T>(
		data: CrmActionLog[],
		key: keyof CrmActionLog,
		referenceData: any[],
		referenceKey: string
	): T[] {
		const countMap: Record<string, number> = {};
		let totalActions = 0;

		data.forEach(entry => {
			if (entry[key]) {
				countMap[entry[key] as string] = (countMap[entry[key] as string] || 0) + 1;
				totalActions++;
			}
		});

		return referenceData.map(item => {
			const actionCount = countMap[item[referenceKey]] || 0;
			return {
				...item,
				total_actions: actionCount,
				ratio: totalActions
					? parseFloat(((actionCount / totalActions) * 100).toFixed(1))
					: 0.0,
			};
		});
	}

	getResponsibleGridData(
		data: CrmActionLog[],
		responsibles: any[],
		selectedUsers: any[]
	): ResposibleGrid[] {
		const filteredUsers = selectedUsers.length
			? responsibles.filter(responsible => selectedUsers.includes(responsible.id))
			: responsibles;

		const gridData = this.calculateGridData<ResposibleGrid>(
			data,
			"user_custom_id",
			filteredUsers,
			"custom_id"
		).sort((a, b) => b.ratio - a.ratio);

		return gridData.map(grid => ({
			...grid,
			formatted_ratio: this.formatToPercentage(grid.ratio),
		})) as ResposibleGrid[];
	}

	getActionGridData(data: CrmActionLog[], actions: any[], selectedActions: any[]): ActionGrid[] {
		// Filter data based on selectedActions
		const filteredActions = selectedActions.length
			? actions.filter(action => selectedActions.includes(action.id))
			: actions;

		const gridData = this.calculateGridData<ActionGrid>(
			data,
			"crm_action_custom_id",
			filteredActions,
			"custom_id"
		).sort((a, b) => b.ratio - a.ratio);

		return gridData.map(grid => ({
			...grid,
			formatted_ratio: this.formatToPercentage(grid.ratio),
		})) as ActionGrid[];
	}

	getCountryGridData(
		data: CrmActionLog[],
		countries: any[],
		selectedCountries: any[]
	): CountryGrid[] {
		const filteredCountries = selectedCountries.length
			? countries.filter(country => selectedCountries.includes(country.id))
			: countries;

		const gridData = this.calculateGridData<CountryGrid>(
			data,
			"country_custom_id",
			filteredCountries,
			"custom_id"
		).sort((a, b) => b.ratio - a.ratio);

		return gridData.map(grid => ({
			...grid,
			formatted_ratio: this.formatToPercentage(grid.ratio),
		})) as CountryGrid[];
	}

	getSegmentActionChart(data: CrmActionLog[]): MarketSegments[] {
		const segmentCountMap: Record<string, number> = {};

		data.forEach(entry => {
			if (entry.market_segment_name) {
				segmentCountMap[entry.market_segment_name] =
					(segmentCountMap[entry.market_segment_name] || 0) + 1;
			}
		});

		return Object.entries(segmentCountMap)
			.map(([name, ratio]) => ({ name, ratio }))
			.sort((a, b) => a.ratio - b.ratio);
	}

	formatToPercentage(value: number): string {
		return `${value.toFixed(1)}%`;
	}

	/**  **Reusable Chart Data Generator** */
	generateActionChart(
		data: CrmActionLog[],
		dateRanges: any[],
		filterKey: keyof CrmActionLog
	): ChartRangeList[] {
		const actionCountMap: Record<string, number> = {};

		// Initialize the action count map with date ranges
		dateRanges.forEach(element => {
			actionCountMap[element] = 0;
		});

		// Count actions based on the dynamic filter key
		data.forEach(log => {
			const dateKey = log[filterKey]; // Access the log property dynamically using filterKey

			if (dateKey) {
				actionCountMap[dateKey] = (actionCountMap[dateKey] || 0) + 1;
			}
		});
		// Map the action count to the desired structure
		return Object.keys(actionCountMap).map(date => ({
			numberOfWeek: date,
			value: actionCountMap[date], // Use the date key to access the value
		}));
	}

	/** **Reusable Grid Column Generator** */
	generateGridColumns(
		entity:
			| ActionReportGridName.RESPONSIBLE
			| ActionReportGridName.ACTION
			| ActionReportGridName.COUNTRY
	): any {
		const headers = {
			Responsible: $localize`${ActionReportGridName.RESPONSIBLE}`,
			Action: $localize`${ActionReportGridName.ACTION}`,
			Country: $localize`${ActionReportGridName.COUNTRY}`,
		};

		return [
			{
				Header: headers[entity],
				accessor: "name",
				isSelected: true,
				hAlign: "Left",
				disableFilters: false,
				disableGroupBy: true,
				Cell: (instance: any) => {
					const rowData = instance.row.original;
					const index = instance.row.index;

					return (
						<React.StrictMode>
							<FlexBox
								id={instance.row.original + entity}
								className="w-full justify-center cursor-pointer"
								onClick={() => {
									// this.handleCellClick(rowData, entity, index);
								}}>
								<Text>{rowData.name}</Text>
							</FlexBox>
						</React.StrictMode>
					);
				},
			},
			{
				Header: $localize`Total Actions`,
				accessor: "total_actions",
				isSelected: true,
				hAlign: "Left",
				disableFilters: false,
				disableGroupBy: true,
				width: 100,
			},
			{
				Header: $localize`Ratio`,
				accessor: "formatted_ratio",
				isSelected: true,
				hAlign: "Left",
				disableFilters: false,
				disableGroupBy: true,
				width: 100,
			},
		];
	}

	clearCustomFilters() {
		this.actionGridFilterSelectionSubject.next(true);
		this.userGridFilterSelectionSubject.next(true);
		this.countryGridFilterSelectionSubject.next(true);
		this.segmentBarChartFilterSubject.next(true);
		this.dateRangeBarChartFilterSubject.next(true);

		this.updateSelectedUsers([]);
		this.updateSelectedActions([]);
		this.updateSelectedCountries([]);
		this.updateSegmentBarChartEvent([]);
		this.updateChartClickEvent([]);
	}

	/**
	 * Handles cell click events for different grid types.
	 * Updates the selected items based on single or multiple selection mode.
	 *
	 * @param data - The clicked cell data containing `id`.
	 * @param gridType - The type of grid ("action", "responsible", "country").
	 */

	public handleCellClick(data: number[], gridType: string, index: number) {
		if (gridType === ActionReportGridName.ACTION) {
			const currentActions = this.selectedActionsSubject.value;
			// Single selection (uncomment if needed)
			// this.updateSelectedActions(this.toggleSelection(currentActions, data[0]));

			this.updateSelectedActions(data);
			// this.updateSelectedActions(this.toggleMultiSelection(currentActions, data));
		} else if (gridType === ActionReportGridName.RESPONSIBLE) {
			const currentUsers = this.selectedUsersSubject.value;

			// Single selection (uncomment if needed)
			// this.updateSelectedUsers(this.toggleSelection(currentUsers, data[0]));

			// TODO:: This portion is for multiple selection
			this.updateSelectedUsers(data);
			// this.updateSelectedUsers(this.toggleMultiSelection(currentUsers, data));
		} else if (gridType === ActionReportGridName.COUNTRY) {
			const currentCountries = this.selectedCountriesSubject.value;

			// Single selection (uncomment if needed)
			// this.updateSelectedCountries(this.toggleSelection(currentCountries, countryId));

			// TODO:: This portion is for multiple selection
			this.updateSelectedCountries(data);
			// this.updateSelectedCountries(this.toggleMultiSelection(currentCountries, data));
		}
	}

	/**
	 * Toggles selection based on the presence of the item in the list.
	 * If the item exists, it removes it; otherwise, it selects only that item.
	 *
	 * @param currentSelection - The current selection array.
	 * @param itemId - The ID of the item clicked.
	 * @returns Updated selection array.
	 */
	private toggleSelection(currentSelection: number[], itemId: number): number[] {
		return currentSelection.includes(itemId) ? [] : [itemId];
	}

	/**
	 * Toggles an item in a multi-selection list.
	 * If the item exists, it removes it; otherwise, it adds it.
	 *
	 * @param currentSelection - The current array of selected items.
	 * @param itemId - The ID of the item clicked.
	 * @returns Updated selection array.
	 */

	private toggleMultiSelection(currentSelection: number[], items: number[]): number[] {
		return items.reduce(
			(selection, itemId) =>
				selection.includes(itemId)
					? selection.filter(id => id !== itemId) // Remove if exists
					: [...selection, itemId], // Add if not exists
			currentSelection
		);
	}

	private areArraysEqual(arr1: string[], arr2: string[]): boolean {
		if (arr1.length !== arr2.length) return false;

		return [...arr1].sort().join(",") === [...arr2].sort().join(",");
	}
}
