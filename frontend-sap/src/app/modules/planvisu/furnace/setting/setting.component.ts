import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CustomReactGridTable } from '@app/shared/components/CustomGridTable';
import { MachineGroup } from '@app/shared/models/machine-group.model';
import { Machine } from '@app/shared/models/machine.model';
import { Localization } from '@app/shared/utils/common-localize';
import moment from 'moment';

@Component({
	selector: "app-setting",
	templateUrl: "./setting.component.html",
	styleUrl: "./setting.component.css",
})
export class SettingComponent {
	@Input() isViewSettingsOpen = false;
	@Input() machines: Machine[] = [];
	@Input() machineGroups: MachineGroup[] = [];
	@Input() columns: any[] = [];
	@Input() gridTable?: CustomReactGridTable;
	@Input() hallId?: string;
	@Output() saveEvent = new EventEmitter<any[]>();
	@ViewChild("list") list?: any;
	@Input() showOpenOrders = true;
	localization = Localization;;

	protected selectedMachines: [] = [];
	protected selectedMachineGroups: [] = [];
	protected selectedItems = [];
	protected selectedTab = SelectedTab.Column;
	protected selectedTabs = SelectedTab;
	protected prodDate = "";
	protected startDateSap = "";
	protected order = "";
	protected trip = "";
	protected linkedOrders = "";
	protected material = "";
	protected materialType = "";
	protected productType = "";
	protected name = "";
	protected item = "";
	protected isReset = false;

	machineChange(event: any) {
		this.selectedMachines = event.detail.items.map((machine: any) => machine.id);
		this.machines.forEach(machine => {
			const index = this.selectedMachines.findIndex(machineId => machine.id == machineId);
			machine.isSelected = index != -1;
		});
	}

	machineGroupChange(event: any) {
		this.selectedMachineGroups = event.detail.items.map((machineGroup: any) => machineGroup.id);
		this.machineGroups.forEach(machineGroup => {
			const index = this.selectedMachineGroups.findIndex(
				machineGroupId => machineGroup.id == machineGroupId
			);
			machineGroup.isSelected = index != -1;
		});
	}

	selectionChange(event: any) {
		this.selectedItems = event.detail.selectedItems;
		this.columns.forEach((column, i) => {
			const index = this.selectedItems.findIndex((item: any) => item.id == i);
			this.columns[i].isSelected = index != -1;
		});
		this.isReset = false;
	}

	tabChange(event: any) {
		this.selectedTab = event.detail.tab.id;
	}

	closeDialog() {
		this.isViewSettingsOpen = false;
	}

	openDialog() {
		this.isViewSettingsOpen = true;
	}

	save() {
		let customUrl = `/prod_order_pos_operation/get_prod_order_with_prod_lot/${this.hallId}?`;

		if (this.selectedMachines.length && this.selectedMachines.length != this.machines.length) {
			customUrl += `&machine=${this.selectedMachines.join()}`;
		}

		if (
			this.selectedMachineGroups.length &&
			this.selectedMachineGroups.length != this.machineGroups.length
		) {
			customUrl += `&machine_group=${this.selectedMachineGroups.join()}`;
		}

		if (this.prodDate) {
			customUrl += `&prod_lot_start=${moment(this.prodDate).format("YYYY-MM-DD")}`;
		}

		if (this.startDateSap) {
			customUrl += `&start_date_sap=${moment(this.startDateSap).format("YYYY-MM-DD")}`;
		}

		if (this.order) {
			customUrl += `&prod_order_custom_id=${this.order}`;
		}

		if (this.trip) {
			customUrl += `&prod_lot_custom_id=${this.trip}`;
		}

		if (this.name) {
			customUrl += `&name=${this.name}`;
		}

		if (this.item) {
			customUrl += `&item=${this.item}`;
		}

		if (this.linkedOrders) {
			customUrl += `&linked_orders=${this.linkedOrders}`;
		}

		if (this.material) {
			customUrl += `&material=${this.material}`;
		}

		if (this.materialType) {
			customUrl += `&material_type=${this.materialType}`;
		}

		if (this.productType) {
			customUrl += `&product_type=${this.productType}`;
		}

		customUrl += `&show-open-orders=${this.showOpenOrders}`;

		this.resetingTablebyApiType(customUrl);

		this.doColumnSelection();

		this.closeDialog();

		this.saveEvent.emit(this.columns);
		this.isReset = false;
	}

	resetingTablebyApiType(customUrl: string) {
		const isMachineOK =
			this.selectedMachines.length && this.selectedMachines.length != this.machines.length;
		const isMachineGroupOK =
			this.selectedMachineGroups.length &&
			this.selectedMachineGroups.length != this.machineGroups.length;

		if (
			isMachineOK ||
			isMachineGroupOK ||
			this.prodDate ||
			this.startDateSap ||
			this.order ||
			this.trip ||
			this.name ||
			this.item ||
			this.linkedOrders ||
			this.material ||
			this.materialType ||
			this.productType
		) {
			this.gridTable!.customUrl = customUrl;
			this.gridTable!.skip = 0;
			this.gridTable?.onPagination(true);
		} else {
			this.gridTable!.customUrl = "";
			this.gridTable!.skip = 0;
			this.gridTable?.onPagination(true);
		}
	}

	doColumnSelection() {
		if (this.isReset) {
			this.isReset = true;
			return;
		}
		if (this.selectedItems.length) {
			this.columns.forEach((column, i) => {
				const index = this.selectedItems.findIndex((item: any) => item.id == i.toString());
				if (index != -1) {
					this.columns[i].isSelected = true;
				} else {
					this.columns[i].isSelected = false;
				}
			});
		}

		this.cacheColumns();
	}

	reset() {
		this.isReset = true;
		this.resetCoulumns();
		this.resetFilters();
		this.startDateSap = "";
		this.prodDate = "";
		this.order = "";
		this.trip = "";
		this.name = "";
		this.item = "";
		this.linkedOrders = "";
		this.material = "";
		this.materialType = "";
		this.productType = "";
	}

	resetFilters() {
		this.resetOven();
		this.resetGoupOven();
	}

	resetOven() {
		this.machines.forEach(machine => {
			machine.isSelected = true;
		});

		this.selectedMachines = [];
	}

	resetGoupOven() {
		this.machineGroups.forEach(machineGroup => {
			machineGroup.isSelected = true;
		});

		this.selectedMachineGroups = [];
	}

	resetCoulumns() {
		this.columns.forEach((column: any) => {
			column.isSelected = column.isPreSelected;
		});

		this.cacheColumns();
	}

	cacheColumns() {
		const columns = this.columns.map((column: any) => {
			return { accessor: column.accessor, isSelected: column.isSelected };
		});

		localStorage.setItem("furnaceTrip", JSON.stringify(columns));
	}
}
enum SelectedTab {
  Column,
  Sort,
  Filter
}
