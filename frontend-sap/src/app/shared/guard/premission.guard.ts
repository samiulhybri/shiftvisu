import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { inject } from "@angular/core";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

export const premissionGuard: CanActivateFn = async (route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);
	const isUserLoggedIn = await authService.isUserLoggedIn();
	const url = state.url.replace(/[0-9]/g, "");

	if (!isUserLoggedIn) return false;

	if (`${url}` in urlPermissions) {
		if (urlPermissions[url] && Array.isArray(urlPermissions[url])) {
			urlPermissions[url].map((permission: string) => {
				if (authService.isPermissionValid(permission)) return true;
				else {
					window.location.href = window.location.origin;
					return false;
				}
			});
		} else {
			if (authService.isPermissionValid(urlPermissions[url])) return true;
			else {
				window.location.href = window.location.origin;
				return false;
			}
		}
	}
	return true;
};

const urlPermissions: any = {
	"/base-visu/machine": PermissionEnum.BASEVISU_MACHINES_VIEW,
	"/base-visu/printers": PermissionEnum.BASEVISU_PRINTERS_VIEW,
	"/base-visu/terminals": PermissionEnum.BASEVISU_TERMINALS_VIEW,
	"/base-visu": PermissionEnum.BASEVISU_VIEW,
	"/base-visu/machine-group": PermissionEnum.BASEVISU_MACHINE_GROUPS_VIEW,
	"/base-visu/machine-state-groups": PermissionEnum.BASEVISU_MACHINE_STATE_GROUPS_VIEW,
	"/base-visu/machine-state": PermissionEnum.BASEVISU_MACHINE_STATES_VIEW,
	"/base-visu/user-group": PermissionEnum.BASEVISU_USER_GROUPS_VIEW,
	"/base-visu/item-group": PermissionEnum.BASEVISU_ITEM_GROUPS_VIEW,
	"/base-visu/tools": PermissionEnum.BASEVISU_TOOLS_VIEW,
	"/base-visu/item-states": PermissionEnum.BASEVISU_ITEM_STATES_VIEW,
	"/base-visu/item": PermissionEnum.BASEVISU_ITEMS_VIEW,
	"/base-visu/operation-control-profiles": PermissionEnum.BASEVISU_OPERATION_CONTROL_PROFILE_VIEW,
	"/base-visu/qualifications": PermissionEnum.BASEVISU_QUALIFICATIONS_VIEW,
	"/base-visu/user": PermissionEnum.BASEVISU_USERS_VIEW,
	"/base-visu/notification-group": PermissionEnum.BASEVISU_NOTIFICATION_GROUPS_VIEW,
	"/base-visu/settings": PermissionEnum.BASEVISU_SETTINGS_VIEW,
	"/base-visu/role": PermissionEnum.BASEVISU_ROLES_VIEW,
	"/base-visu/permission": PermissionEnum.BASEVISU_PERMISSIONS_VIEW,
	"/base-visu/hall": PermissionEnum.BASEVISU_HALLS_VIEW,
	"/base-visu/shift-model": PermissionEnum.BASEVISU_SHIFT_MODELS_VIEW,
	"/base-visu/tpm-sub-group": PermissionEnum.BASEVISU_TPM_SUB_GROUPS_VIEW,
	"/base-visu/tpm-groups": PermissionEnum.BASEVISU_TPM_GROUPS_VIEW,
	"/base-visu/plant": PermissionEnum.BASEVISU_PLANTS_VIEW,
	"/base-visu/storage-location": PermissionEnum.BASEVISU_STORAGE_LOCATION_VIEW,
	"/base-visu/warehouse": PermissionEnum.BASEVISU_WAREHOUSE_VIEW,
	"/base-visu/storage-type": PermissionEnum.BASEVISU_STORAGE_TYPE_VIEW,
	"/base-visu/storage-section": PermissionEnum.BASEVISU_STORAGE_SECTION_VIEW,
	"/base-visu/storage-bin": PermissionEnum.BASEVISU_STORAGE_BIN_VIEW,
	"/base-visu/production-supply-area": PermissionEnum.BASEVISU_PRODUCTION_SUPPLY_AREA_VIEW,
	"/base-visu/revenue-classifications": PermissionEnum.BASEVISU_REVENUE_CLASSIFICATIONS_VIEW,
	"/base-visu/employee-classifications": PermissionEnum.BASEVISU_EMPLOYEE_CLASSIFICATIONS_VIEW,
	"/base-visu/transport-order-type": PermissionEnum.BASEVISU_TRANSPORT_ORDER_TYPE_VIEW,
	"/base-visu/potential-classifications": PermissionEnum.BASEVISU_POTENTIAL_CLASSIFICATIONS_VIEW,
	"/base-visu/machine-classifications": PermissionEnum.BASEVISU_MACHINE_CLASSIFICATIONS_VIEW,
	"/base-visu/sales-status": PermissionEnum.BASEVISU_SALES_STATUS_VIEW,
	"/base-visu/market-segments": PermissionEnum.BASEVISU_MARKET_SEGMENTS_VIEW,
	"/base-visu/energy-consumer-groups": PermissionEnum.BASEVISU_ENERGY_CONSUMER_GROUPS_VIEW,
	"/base-visu/crm-actions": PermissionEnum.BASEVISU_CRM_ACTION_VIEW,
	"/base-visu/areas": PermissionEnum.BASEVISU_AREA_VIEW,
	"/base-visu/customer-categories": PermissionEnum.BASEVISU_CUSTOMER_CATEGORY_VIEW,
	"/statusboard": PermissionEnum.STATUSBOARD_VIEW,
	"/logistics": PermissionEnum.LOGIVISU_VIEW,
	"/planvisu/hall/": PermissionEnum.PRODUCTION_PLAN_PAGE_VIEW,
	"/planvisu/forge/": PermissionEnum.PRODUCTION_PLAN_PAGE_VIEW,
	"/planvisu/furnace/": PermissionEnum.PRODUCTION_PLAN_PAGE_VIEW,
	"/planvisu/gantt": PermissionEnum.PLANVISU_GANTT_CHART_PAGE_VIEW,
	"/planvisu/machine-scheduler": PermissionEnum.PLANVISU_MACHINE_SCHEDULAR_PAGE_VIEW,
	"/planvisu/user-scheduler": PermissionEnum.PLANVISU_USER_SCHEDULAR_PAGE_VIEW,
	"/planvisu/range-overview": PermissionEnum.PLANVISU_RANGE_OVERVIEW_PAGE_VIEW,
	"/planvisu/create-order": PermissionEnum.PLANVISU_ORDER_CREATE_PAGE_VIEW,
	"/planvisu/order-view": PermissionEnum.PLANVISU_ORDER_VIEW,
	"/planvisu/staff-needed/": PermissionEnum.PLANVISU_STAFF_NEEDED_PAGE_VIEW,
	"/planvisu/staff-workload/": PermissionEnum.PLANVISU_STAFF_WORKLOAD_PAGE_VIEW,
	"/planvisu/machine-workload/": PermissionEnum.PLANVISU_MACHINE_WORKLOAD_PAGE_VIEW,
	"/planvisu/setup-plan": PermissionEnum.PLANVISU_SET_UP_PLAN_VIEW,
	"/planvisu/export-import": PermissionEnum.PLANVISU_EXPORT_IMPORT_VIEW,
	"/planvisu/settings/color-schemes": PermissionEnum.PLANVISU_COLOR_SCHEME_VIEW,
	"/planvisu/settings/color-schemes-sortings": PermissionEnum.PLANVISU_COLOR_SCHEME_SORTING_VIEW,
	"/planvisu/settings": PermissionEnum.PLANVISU_SETTING_VIEW,
	"/tool-visu": PermissionEnum.TOOLVISU_VIEW,
	"/tool-visu/tool-repair": PermissionEnum.TOOLVISU_TOOL_REPAIR_VIEW,
	"/tool-visu/planned-orders": PermissionEnum.TOOLVISU_PLANNED_ORDERS_VIEW,
	"/tool-visu/repair-history": PermissionEnum.TOOLVISU_REPAIR_HISTORY_VIEW,
	"/tool-visu/order-history": PermissionEnum.TOOLVISU_ORDER_HISTORY_VIEW,
	"/tool-visu/overview": PermissionEnum.TOOLVISU_TOOL_OVERVIEW_VIEW,
	"/tool-visu/settings": PermissionEnum.TOOLVISU_SETTINGS_VIEW,
	"/machine-board/": PermissionEnum.MACHINEBOARD_VIEW,
	"/interface-monitoring/": PermissionEnum.INTERFACE_MONITORING_VIEW,
	"/interface-monitoring/data-exports": PermissionEnum.DATA_EXPORTS_VIEW,
	"/interface-monitoring/scheduled-commands": PermissionEnum.COMMAND_SCHEDULES_VIEW,
	"/time-visu/time-record": PermissionEnum.TIMEVISU_TIME_RECORD_VIEW,
	"/doc-visu": PermissionEnum.DOCVISU_VIEW,
	"/shift-visu": PermissionEnum.SHIFTVISU_VIEW,
	"/shift-visu/settings": PermissionEnum.SHIFTVISU_ADMIN,
	"/crm": PermissionEnum.CRM_VIEW,
	"/time-visu": PermissionEnum.TIMEVISU_VIEW,
	"/crm/crm-page": [PermissionEnum.CRM_CRM_PAGE_VIEW, PermissionEnum.CRM_VIEW],
	"/crm/sales-funnel": [PermissionEnum.CRM_SALES_FUNNEL_VIEW, PermissionEnum.CRM_VIEW],
	"/crm/kanban": [PermissionEnum.CRM_KANBAN_VIEW, PermissionEnum.CRM_VIEW],
	"/quali-visu": PermissionEnum.QUALIVISU_VIEW,
	"/quali-visu/inspection-point": [PermissionEnum.QUALIVISU_INSPECTION_POINT_VIEW, PermissionEnum.QUALIVISU_VIEW],
	"/quali-visu/eight-d-report": [PermissionEnum.QUALIVISU_8D_REPORT_VIEW, PermissionEnum.QUALIVISU_VIEW],
};
