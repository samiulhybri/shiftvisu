export enum BackendModelType {
	PRODORDERPOSOPERATION = "App\\Models\\ProdOrderPosOperation",
	HANDLINGUNIT = "App\\Models\\HandlingUnit",
	MACHINE = "App\\Models\\Machine",
	ITEM = "App\\Models\\Item",
	ITEMPLANT = "App\\Models\\ItemPlant",
	PRODUCTIONSUPPLYAREA = "App\\Models\\ProductionSupplyArea",
	STORAGE_LOCATION = "App\\Models\\StorageLocation",
	PACKAGING_INSTRUCTION = "App\\Models\\PackagingInstruction",
	Equipment = "App\\Models\\Equipment",

	// DocVisu Model
	MACHINE_GROUP = "App\\Models\\MachineGroup",
	ITEM_GROUP = "App\\Models\\ItemGroup",
	SERIAL_NUMBER_PROFILE = "App\\Models\\SerialNumberProfile",
	TOOL = "App\\Models\\Tool",
	QUALIFICATION = "App\\Models\\Qualification",
	PLANT = "App\\Models\\Plant",
	WAREHOUSE = "App\\Models\\Warehouse",
	HALL = "App\\Models\\Hall",
	CUSTOMER = "App\\Models\\Customer",
	CUSTOMER_GROUP = "App\\Models\\CustomerGroup",
	SUPPLIER = "App\\Models\\Supplier",

	//ShiftVisu Model
	USER = "App\\Models\\User",
}

export class BackendModelTypeClass {
	static getStateTranslate(
		state: any
	): { text: string; route: string; icon: string, modelType: string } | null {
		switch (state) {
			case BackendModelType.PRODORDERPOSOPERATION:
				return {
					text: $localize`Orders List`,
					route: "/ProdOrderPosOperations",
					icon: "my-sales-order",
					modelType: BackendModelType.PRODORDERPOSOPERATION,
				};
			case BackendModelType.HANDLINGUNIT:
				return {
					text: $localize`Handling Unit`,
					route: "/HandlingUnits",
					icon: "sap-icon://SAP-icons-TNT/flow",
					modelType: BackendModelType.HANDLINGUNIT,
				};
			case BackendModelType.MACHINE:
				return {
					text: $localize`Machine`,
					route: "/Machines",
					icon: "machine",
					modelType: BackendModelType.MACHINE,
				};
			case BackendModelType.ITEM:
				return {
					text: $localize`Item`,
					route: "/Items",
					icon: "product",
					modelType: BackendModelType.ITEM,
				};
			case BackendModelType.ITEMPLANT:
				return {
					text: $localize`Item`,
					route: "/ItemPlants",
					icon: "sap-icon://BusinessSuiteInAppSymbols/icon-variant-planning",
					modelType: BackendModelType.ITEMPLANT,
				};
			case BackendModelType.PRODUCTIONSUPPLYAREA:
				return {
					text: $localize`Production Supply Area`,
					route: "/ProductionSupplyAreas",
					icon: "sap-icon://BusinessSuiteInAppSymbols/icon-refinery",
					modelType: BackendModelType.PRODUCTIONSUPPLYAREA,
				};
			case BackendModelType.STORAGE_LOCATION:
				return {
					text: $localize`Storage Location`,
					route: "/StorageLocations",
					icon: "sap-icon://SAP-icons-TNT/data-store",
					modelType: BackendModelType.STORAGE_LOCATION,
				};
			case BackendModelType.MACHINE_GROUP:
				return {
					text: $localize`Machine Group`,
					route: "/MachineGroups",
					icon: "sap-icon://BusinessSuiteInAppSymbols/icon-forklift",
					modelType: BackendModelType.MACHINE_GROUP,
				};
			case BackendModelType.ITEM_GROUP:
				return {
					text: $localize`Item Group`,
					route: "/ItemGroups",
					icon: "sap-icon://BusinessSuiteInAppSymbols/icon-products",
					modelType: BackendModelType.ITEM_GROUP,
				};
			case BackendModelType.SERIAL_NUMBER_PROFILE:
				return {
					text: $localize`Serial Number Profile`,
					route: "/SerialNumberProfiles",
					icon: "sap-icon://contacts",
					modelType: BackendModelType.SERIAL_NUMBER_PROFILE,
				};
			case BackendModelType.TOOL:
				return {
					text: $localize`Tool`,
					route: "/Tools",
					icon: "sap-icon://wrench",
					modelType: BackendModelType.TOOL,
				};
			case BackendModelType.QUALIFICATION:
				return {
					text: $localize`Qualification`,
					route: "/Qualifications",
					icon: "sap-icon://study-leave",
					modelType: BackendModelType.QUALIFICATION,
				};
			case BackendModelType.PLANT:
				return {
					text: $localize`Plant`,
					route: "/Plants",
					icon: "sap-icon://legend",
					modelType: BackendModelType.PLANT,
				};
			case BackendModelType.WAREHOUSE:
				return {
					text: $localize`Warehouse`,
					route: "/Warehouses",
					icon: "sap-icon://BusinessSuiteInAppSymbols/icon-stock-warehouse",
					modelType: BackendModelType.WAREHOUSE,
				};
			case BackendModelType.HALL:
				return {
					text: $localize`Hall`,
					route: "/Halls",
					icon: "sap-icon://factory",
					modelType: BackendModelType.HALL,
				};
			case BackendModelType.CUSTOMER:
				return {
					text: $localize`Customer`,
					route: "/Customers",
					icon: "sap-icon://customer",
					modelType: BackendModelType.CUSTOMER,
				};
			case BackendModelType.CUSTOMER_GROUP:
				return {
					text: $localize`Customer Group`,
					route: "/CustomerGroups",
					icon: "sap-icon://group",
					modelType: BackendModelType.CUSTOMER_GROUP,
				};
			case BackendModelType.SUPPLIER:
				return {
					text: $localize`Supplier`,
					route: "/Suppliers",
					icon: "sap-icon://supplier",
					modelType: BackendModelType.SUPPLIER,
				};
			case BackendModelType.USER:
				return {
					text: $localize`User`,
					route: "/Users",
					icon: "sap-icon://person-placeholder",
					modelType: BackendModelType.USER,
				};
			case BackendModelType.Equipment:
				return {
					text: $localize`Equipment`,
					route: "/Equipements",
					icon: "sap-icon://person-placeholder",
					modelType: BackendModelType.Equipment,
				};
			default:
				return null;
		}
	}

	static getStateDocVisu(state: any): boolean {
		switch (state) {
			case BackendModelType.MACHINE_GROUP:
				return true;
			case BackendModelType.ITEM_GROUP:
				return true;
			case BackendModelType.SERIAL_NUMBER_PROFILE:
				return true;
			case BackendModelType.TOOL:
				return true;
			case BackendModelType.QUALIFICATION:
				return true;
			case BackendModelType.PLANT:
				return true;
			case BackendModelType.WAREHOUSE:
				return true;
			case BackendModelType.HALL:
				return true;
			case BackendModelType.CUSTOMER:
				return true;
			case BackendModelType.CUSTOMER_GROUP:
				return true;
			case BackendModelType.SUPPLIER:
				return true;
			case BackendModelType.MACHINE:
				return true;
			case BackendModelType.ITEM:
				return true;
			case BackendModelType.STORAGE_LOCATION:
				return true;
			default:
				return false;
		}
	}

	static getStateShiftVisu(state: any): boolean {
		switch (state) {
			case BackendModelType.MACHINE_GROUP:
				return true;
			case BackendModelType.ITEM_GROUP:
				return true;
			case BackendModelType.SERIAL_NUMBER_PROFILE:
				return true;
			case BackendModelType.TOOL:
				return true;
			case BackendModelType.QUALIFICATION:
				return true;
			case BackendModelType.PLANT:
				return true;
			case BackendModelType.WAREHOUSE:
				return true;
			case BackendModelType.HALL:
				return true;
			case BackendModelType.CUSTOMER:
				return true;
			case BackendModelType.CUSTOMER_GROUP:
				return true;
			case BackendModelType.SUPPLIER:
				return true;
			case BackendModelType.MACHINE:
				return true;
			case BackendModelType.ITEM:
				return true;
			case BackendModelType.STORAGE_LOCATION:
				return true;
			case BackendModelType.USER:
				return true;
			default:
				return false;
		}
	}

	static getEnumArray() {
		let res_arr: any = [];
		let enums = Object.keys(BackendModelType);
		enums.forEach(elm => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}

	static getEnumArrayDocVisu(): {
		value: string;
		text: string;
		route: string;
		icon: string;
		modelType: string;
	}[] {
		let res_arr: any = [];
		let enums = Object.keys(BackendModelType);
		enums.forEach(elm => {
			if (isNaN(Number(elm))) {
				const value = BackendModelType[elm as keyof typeof BackendModelType];
				if (this.getStateDocVisu(value)) {
					res_arr.push({ value: elm, ...this.getStateTranslate(value) });
				}
			}
		});

		res_arr.sort((a: any, b: any) => {
			return a.text.localeCompare(b.text);
		});

		return res_arr;
	}

	static getEnumArrayShiftVisu(): {
		value: string;
		text: string;
		route: string;
		icon?: string;
		modelType: string;
	}[] {
		let res_arr: any = [];
		let enums = Object.keys(BackendModelType);
		enums.forEach(elm => {
			if (isNaN(Number(elm))) {
				const value = BackendModelType[elm as keyof typeof BackendModelType];
				if (this.getStateShiftVisu(value)) {
					res_arr.push({ value: elm, ...this.getStateTranslate(value) });
				}
			}
		});

		res_arr.sort((a: any, b: any) => {
			return a.text.localeCompare(b.text);
		});

		return res_arr;
	}
}
