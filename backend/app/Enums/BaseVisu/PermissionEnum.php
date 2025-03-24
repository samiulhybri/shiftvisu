<?php

namespace App\Enums\BaseVisu;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self BASEVISU_VIEW()
 *
 * @method static self BASEVISU_MACHINES_EDIT()
 * @method static self BASEVISU_MACHINES_VIEW()
 *
 * @method static self BASEVISU_MACHINE_GROUPS_EDIT()
 * @method static self BASEVISU_MACHINE_GROUPS_VIEW()
 *
 * @method static self BASEVISU_TPM_GROUPS_EDIT()
 * @method static self BASEVISU_TPM_GROUPS_VIEW()
 *
 * @method static self BASEVISU_TPM_SUB_GROUPS_EDIT()
 * @method static self BASEVISU_TPM_SUB_GROUPS_VIEW()
 *
 * @method static self BASEVISU_MACHINE_STATES_EDIT()
 * @method static self BASEVISU_MACHINE_STATES_VIEW()
 *
 * @method static self BASEVISU_MACHINE_STATE_GROUPS_EDIT()
 * @method static self BASEVISU_MACHINE_STATE_GROUPS_VIEW()
 *
 * @method static self BASEVISU_ITEM_STATES_EDIT()
 * @method static self BASEVISU_ITEM_STATES_VIEW()
 *
 * @method static self BASEVISU_ITEMS_EDIT()
 * @method static self BASEVISU_ITEMS_VIEW()
 *
 * @method static self BASEVISU_ITEM_TYPES_EDIT()
 * @method static self BASEVISU_ITEM_TYPES_VIEW()
 *
 * @method static self BASEVISU_ITEM_GROUPS_EDIT()
 * @method static self BASEVISU_ITEM_GROUPS_VIEW()
 *
 * @method static self BASEVISU_TOOLS_EDIT()
 * @method static self BASEVISU_TOOLS_VIEW()
 *
 * @method static self BASEVISU_USERS_EDIT()
 * @method static self BASEVISU_USERS_VIEW()
 *
 * @method static self BASEVISU_USER_GROUPS_EDIT()
 * @method static self BASEVISU_USER_GROUPS_VIEW()
 *
 * @method static self BASEVISU_NOTIFICATION_GROUPS_EDIT()
 * @method static self BASEVISU_NOTIFICATION_GROUPS_VIEW()
 *
 * @method static self BASEVISU_QUALIFICATIONS_EDIT()
 * @method static self BASEVISU_QUALIFICATIONS_VIEW()
 *
 * @method static self BASEVISU_HALLS_EDIT()
 * @method static self BASEVISU_HALLS_VIEW()
 *
 * @method static self BASEVISU_CUSTOMERS_EDIT()
 * @method static self BASEVISU_CUSTOMERS_VIEW()
 *
 * @method static self BASEVISU_CUSTOMER_GROUPS_EDIT()
 * @method static self BASEVISU_CUSTOMER_GROUPS_VIEW()
 *
 * @method static self BASEVISU_SALES_GROUPS_EDIT()
 * @method static self BASEVISU_SALES_GROUPS_VIEW()
 *
 * @method static self BASEVISU_SUPPLIERS_EDIT()
 * @method static self BASEVISU_SUPPLIERS_VIEW()
 *
 * @method static self BASEVISU_ENERGY_GATEWAYS_EDIT()
 * @method static self BASEVISU_ENERGY_GATEWAYS_VIEW()
 *
 * @method static self BASEVISU_ENERGY_CONSUMERS_EDIT()
 * @method static self BASEVISU_ENERGY_CONSUMERS_VIEW()
 *
 * @method static self BASEVISU_ENERGY_CONSUMER_GROUPS_EDIT()
 * @method static self BASEVISU_ENERGY_CONSUMER_GROUPS_VIEW()
 * 
 * @method static self BASEVISU_ENERGY_METER_EDIT()
 * @method static self BASEVISU_ENERGY_METER_VIEW()
 *
 * @method static self BASEVISU_CRUCIBLES_EDIT()
 * @method static self BASEVISU_CRUCIBLES_VIEW()
 * 
 * @method static self BASEVISU_PRINTERS_EDIT()
 * @method static self BASEVISU_PRINTERS_VIEW()
 *
 * @method static self BASEVISU_TERMINALS_VIEW()
 * @method static self BASEVISU_TERMINALS_EDIT()
 * 
 * @method static self BASEVISU_CAPACITIES_EDIT()
 * @method static self BASEVISU_CAPACITIES_VIEW()
 *
 * @method static self BASEVISU_SHIFT_MODELS_EDIT()
 * @method static self BASEVISU_SHIFT_MODELS_VIEW()
 *
 * @method static self BASEVISU_SHIFT_EDIT()
 * @method static self BASEVISU_SHIFT_VIEW()
 *
 * @method static self BASEVISU_PLANTS_EDIT()
 * @method static self BASEVISU_PLANTS_VIEW()
 *
 *
 * @method static self BASEVISU_STORAGE_LOCATION_EDIT()
 * @method static self BASEVISU_STORAGE_LOCATION_VIEW()
 *
 *
 * @method static self BASEVISU_WAREHOUSE_EDIT()
 * @method static self BASEVISU_WAREHOUSE_VIEW()
 *
 *
 * @method static self BASEVISU_STORAGE_TYPE_EDIT()
 * @method static self BASEVISU_STORAGE_TYPE_VIEW()
 *
 *
 * @method static self BASEVISU_STORAGE_SECTION_EDIT()
 * @method static self BASEVISU_STORAGE_SECTION_VIEW()
 *
 *
 * @method static self BASEVISU_STORAGE_BIN_EDIT()
 * @method static self BASEVISU_STORAGE_BIN_VIEW()
 *
 *
 * @method static self BASEVISU_PRODUCTION_SUPPLY_AREA_EDIT()
 * @method static self BASEVISU_PRODUCTION_SUPPLY_AREA_VIEW()
 *
 * @method static self BASEVISU_SETTINGS_EDIT()
 * @method static self BASEVISU_SETTINGS_VIEW()
 *
 * @method static self BASEVISU_ROLES_EDIT()
 * @method static self BASEVISU_ROLES_VIEW()
 *
 * @method static self BASEVISU_STANDARD_VALUE_KEY_EDIT()
 * @method static self BASEVISU_STANDARD_VALUE_KEY_VIEW()
 *
 * @method static self BASEVISU_ITEM_STATE_GROUP_EDIT()
 * @method static self BASEVISU_ITEM_STATE_GROUP_VIEW()
 *
 * @method static self BASEVISU_USER_CAPACITIES_EDIT()
 * @method static self BASEVISU_USER_CAPACITIES_VIEW()
 *
 * @method static self BASEVISU_HALL_CAPACITY_SETTINGS_VIEW()
 * @method static self BASEVISU_HALL_CAPACITY_SETTINGS_EDIT()
 *
 * @method static self BASEVISU_COUNTRIES_EDIT()
 * @method static self BASEVISU_COUNTRIES_VIEW()
 *
 * @method static self BASEVISU_LANGUAGES_EDIT()
 * @method static self BASEVISU_LANGUAGES_VIEW()
 * 
 * @method static self BASEVISU_REVENUE_CLASSIFICATIONS_EDIT()
 * @method static self BASEVISU_REVENUE_CLASSIFICATIONS_VIEW()
 *
 * @method static self BASEVISU_TRANSPORT_ORDER_TYPE_EDIT()
 * @method static self BASEVISU_TRANSPORT_ORDER_TYPE_VIEW()
 *
 * @method static self BASEVISU_OPERATION_CONTROL_PROFILE_EDIT()
 * @method static self BASEVISU_OPERATION_CONTROL_PROFILE_VIEW()
 *
 * @method static self BASEVISU_EMPLOYEE_CLASSIFICATIONS_EDIT()
 * @method static self BASEVISU_EMPLOYEE_CLASSIFICATIONS_VIEW()
 *
 * @method static self BASEVISU_POTENTIAL_CLASSIFICATIONS_EDIT()
 * @method static self BASEVISU_POTENTIAL_CLASSIFICATIONS_VIEW()
 *
 * @method static self BASEVISU_MACHINE_CLASSIFICATIONS_EDIT()
 * @method static self BASEVISU_MACHINE_CLASSIFICATIONS_VIEW()
 *
 * @method static self BASEVISU_SALES_STATUS_EDIT()
 * @method static self BASEVISU_SALES_STATUS_VIEW()
 *
 * @method static self BASEVISU_MARKET_SEGMENTS_VIEW()
 * @method static self BASEVISU_MARKET_SEGMENTS_EDIT()
 *
 * @method static self BASEVISU_CRM_ACTION_VIEW()
 * @method static self BASEVISU_CRM_ACTION_EDIT()
 * 
 * @method static self BASEVISU_SERIAL_NUMBER_PROFILE_VIEW()
 * @method static self BASEVISU_SERIAL_NUMBER_PROFILE_EDIT()
 * 
 * @method static self BASEVISU_AREA_EDIT()
 * @method static self BASEVISU_AREA_VIEW()
 * 
 * @method static self BASEVISU_CUSTOMER_CATEGORY_EDIT()
 * @method static self BASEVISU_CUSTOMER_CATEGORY_VIEW()
 * 
 * @method static self BASEVISU_PERMISSIONS_VIEW()
 *
 * @method static self HWEKALK_SALES_OPPORTUNITIES_VIEW()
 * @method static self HWEKALK_SALES_OPPORTUNITIES_DELETE()
 * @method static self HWEKALK_SALES_OPPORTUNITIES_IMPORT()
 * @method static self HWEKALK_SALES_OPPORTUNITIES_CREATE_OFFER()
 * @method static self HWEKALK_OFFER_POS_VIEW()
 * @method static self HWEKALK_OFFER_POS_EDIT()
 * @method static self HWEKALK_OFFER_POS_CREATE()
 * @method static self HWEKALK_OFFER_POS_DELETE()
 * @method static self HWEKALK_OFFER_POS_COPY()
 * @method static self HWEKALK_OFFER_POS_COPY_OFFER_ASSESSMENT_BUTTON_VIEW()
 * @method static self HWEKALK_OFFER_POS_COPY_OFFER_POS_BUTTON_VIEW()
 * @method static self HWEKALK_SALES_VIEW()
 * @method static self HWEKALK_SALES_EDIT()
 * @method static self HWEKALK_SALES_COSTS_VIEW()
 * @method static self HWEKALK_SALES_COSTS_GENERATE()
 * @method static self HWEKALK_SALES_COSTS_NEW()
 * @method static self HWEKALK_SALES_COSTS_DELETE()
 *
 * @method static self HWEKALK_OFFER_VIEW()
 * @method static self HWEKALK_OFFER_POS_DOWNLOAD()
 * @method static self HWEKALK_TECHINCAL_ASSESSMENT_VIEW()
 * @method static self HWEKALK_CALC_VIEW()
 * @method static self HWEKALK_CALC_BUTTON_VIEW()
 * @method static self HWEKALK_CALC_MECHANIC_VIEW()
 * @method static self HWEKALK_OBTAIN_EXTERNAL_VIEW()
 * @method static self HWEKALK_QUOTATION_CREATION_VIEW()
 * @method static self HWEKALK_OFFER_CREATE()
 * @method static self HWEKALK_OFFER_EDIT()
 * @method static self HWEKALK_OFFER_DELETE()
 * @method static self HWEKALK_OFFER_ARCHIVED_BUTTON_VIEW()
 * @method static self HWEKALK_OFFER_SEARCH_INPUT_VIEW()
 * @method static self HWEKALK_ASSESSMENT_INFO_BUTTON_VIEW()
 * @method static self HWEKALK_ASSESSMENT_CHANGE_BUTTON_VIEW()
 * @method static self HWEKALK_ASSESSMENT_EDIT_VIEW()
 * @method static self HWEKALK_ASSESSMENT_READ_ONLY()
 * @method static self HWEKALK_INDIVIDUAL_ASSESSMENT_READ_ONLY()
 * @method static self HWEKALK_INDIVIDUAL_ASSESSMENT_EDIT()
 * @method static self HWEKALK_HEAT_TREATMENT_READ_ONLY()
 * @method static self HWEKALK_HEAT_TREATMENT_EDIT()
 * @method static self HWEKALK_CUSTOMER_REQUEST_READ_ONLY()
 * @method static self HWEKALK_CUSTOMER_REQUEST_EDIT()
 * @method static self HWEKALK_DIMENSION_READ_ONLY()
 * @method static self HWEKALK_DIMENSION_EDIT()
 * @method static self HWEKALK_WORK_PLAN_READ_ONLY()
 * @method static self HWEKALK_WORK_PLAN_EDIT()
 * @method static self HWEKALK_WORK_PLAN_DELETE_BUTTON_VIEW()
 * @method static self HWEKALK_WORK_PLAN_GENERATE_BUTTON_VIEW()
 * @method static self HWEKALK_WORK_PLAN_NEW_BUTTON_VIEW()
 * @method static self HWEKALK_WORK_PLAN_GRID_DELETE_BUTTON_VIEW()
 * @method static self HWEKALK_SUMMARY_VIEW()
 * @method static self HWEKALK_OFFER_CRM_UPLOAD()
 * @method static self HWEKALK_OFFER_LOG_VIEW()
 * @method static self HWEKALK_SALES_ACTION()
 * @method static self HWEKALK_EVALUATION_VIEW()
 *
 * @method static self HWEKALK_SPECIFICATIONS_EDIT()
 *
 * @method static self HWEKALK_MATERIALS_EDIT()
 *
 * @method static self HWEKALK_CLIENT_ORDER_VIEW()
 *
 * @method static self HWEKALK_CLIENT_ORDER_RELEASED_EDIT()
 *
 * @method static self HWEKALK_CLIENT_ORDER_HEAT_TREATMENTS_EDIT()
 *
 * @method static self HWEKALK_COSTS_EDIT()
 *
 * @method static self HWEKALK_MATERIAL_DATABASES_EDIT()
 *
 * **** PLAN_VISU_PERMISSIONS ****
 *
 * @method static self PLANVISU_VIEW()
 * 
 * @method static self PLANVISU_GANTT_CHART_PAGE_EDIT()
 * @method static self PLANVISU_GANTT_CHART_PAGE_DELETE()
 * @method static self PLANVISU_GANTT_CHART_PAGE_VIEW()
 * 
 * @method static self PLANVISU_PRODUCTION_PLAN_PAGE_EDIT()
 * @method static self PRODUCTION_PLAN_PAGE_VIEW()
 * 
 * @method static self PLANVISU_MACHINE_SCHEDULAR_PAGE_EDIT()
 * @method static self PLANVISU_MACHINE_SCHEDULAR_PAGE_VIEW()
 * 
 * @method static self PLANVISU_USER_SCHEDULAR_PAGE_EDIT()
 * @method static self PLANVISU_USER_SCHEDULAR_PAGE_VIEW()
 * 
 * @method static self PLANVISU_RANGE_OVERVIEW_PAGE_VIEW()
 * 
 * @method static self PLANVISU_ORDER_CREATE_PAGE_EDIT()
 * @method static self PLANVISU_ORDER_CREATE_PAGE_VIEW()
 * 
 * @method static self PLANVISU_STAFF_NEEDED_PAGE_VIEW()
 * 
 * @method static self PLANVISU_STAFF_WORKLOAD_PAGE_VIEW()
 * 
 * @method static self PLANVISU_MACHINE_WORKLOAD_PAGE_VIEW()
 * 
 * @method static self PLANVISU_ORDER_VIEW()
 * @method static self PLANVISU_ORDER_TREE_VIEW()
 * 
 * @method static self PLANVISU_SET_UP_PLAN_VIEW()
 * @method static self PLANVISU_SET_UP_PLAN_EDIT()
 * 
 * @method static self PLANVISU_EXPORT_IMPORT_VIEW()
 * @method static self PLANVISU_EXPORT_IMPORT_EDIT()
 * 
 * @method static self PLANVISU_COLOR_SCHEME_VIEW()
 * @method static self PLANVISU_COLOR_SCHEME_EDIT()
 * 
 * @method static self PLANVISU_COLOR_SCHEME_SORTING_VIEW()
 * @method static self PLANVISU_COLOR_SCHEME_SORTING_EDIT()
 *
 * @method static self PLANVISU_SETTING_VIEW()
 * 
 * @method static self PLANVISU_USER_PLAN_VIEW()
 * 
 * **** STATUSBOARD_PERMISSION ****
 * @method static self STATUSBOARD_VIEW()
 *
 * **** MACHINEBOARD_PERMISSIONS ****
 * 
 * @method static self MACHINEBOARD_VIEW()
 * @method static self MACHINEBOARD_MACHINE_STATE_CHANGE_VIEW()
 * @method static self MACHINEBOARD_MACHINE_STATE_CHANGE_EDIT()
 * @method static self MACHINEBOARD_MACHINE_STATE_HISTORY_VIEW()
 * @method static self MACHINEBOARD_MACHINE_STATE_HISTORY_EDIT()
 * @method static self MACHINEBOARD_PRODUCTION_PLAN_VIEW()
 * @method static self MACHINEBOARD_PRODUCTION_PLAN_EDIT()
 * @method static self MACHINEBOARD_PRODUCTION_PLAN_PRINT()
 * @method static self MACHINEBOARD_CLOCKIN_CLOCKOUT_EDIT()
 * @method static self MACHINEBOARD_QUANTITY_EDIT()
 * @method static self MACHINEBOARD_QUANTITY_SAVE()
 * @method static self MACHINEBOARD_MATERIAL_CONSUMPTION_EDIT()
 * @method static self MACHINEBOARD_PACKAGING_EDIT()
 * @method static self MACHINEBOARD_DEFAULT_PACKAGING_EDIT()
 * @method static self MACHINEBOARD_RESET_PROPOSAL_EDIT()
 * @method static self MACHINEBOARD_ITEM_PACKAGING_EDIT()

 * @method static self MACHINEBOARD_MACHINE_STATE_CHANGE_EDIT_IF_QUALIFIED()
 * @method static self MACHINEBOARD_MACHINE_STATE_HISTORY_EDIT_IF_QUALIFIED()
 * @method static self MACHINEBOARD_MATERIAL_CONSUMPTION_EDIT_IF_QUALIFIED()
 * @method static self MACHINEBOARD_PACKAGING_EDIT_IF_QUALIFIED()
 * @method static self MACHINEBOARD_DEFAULT_PACKAGING_EDIT_IF_QUALIFIED()
 * @method static self MACHINEBOARD_PRODUCTION_PLAN_EDIT_IF_QUALIFIED()
 * @method static self MACHINEBOARD_QUANTITY_EDIT_IF_QUALIFIED()
 * @method static self MACHINEBOARD_QUANTITY_SAVE_IF_QUALIFIED()
 * @method static self MACHINEBOARD_RESET_PROPOSAL_EDIT_IF_QUALIFIED()
 * @method static self MACHINEBOARD_ITEM_PACKAGING_EDIT_IF_QUALIFIED()
 * 
 * @method static self MACHINEBOARD_PRINT_HU_EDIT()
 * @method static self MACHINEBOARD_PAINTING_LINE_EDIT()
 * 
 * @method static self MACHINEBOARD_PSA_CREATE_SCRAP_FULL_ROW_OF_COMPONENT()
 * @method static self MACHINEBOARD_PSA_CREATE_SCRAP_PARTIAL_QUANTITY_OF_COMPONENT()
 * @method static self MACHINEBOARD_PSA_REMOVE_QUANTITY_FROM_PSA()
 *
 * 
 * **** CAST_VISU_PERMISSIONS ****
 *
 * @method static self CASTVISU_POWER()
 * @method static self CASTVISU_ADMIN()
 * @method static self CASTVISU_SUPER()
 * @method static self CASTVISU_VIEWER()
 *
 *
 * **** Logi_VISU_PERMISSIONS ****
 * @method static self LOGIVISU_VIEW()
 * @method static self LOGIVISU_HWE_VIEW()
 *
 *
 * **** TOOL_VISU_PERMISSIONS ****
 * @method static self TOOLVISU_VIEW()
 *
 * @method static self TOOLVISU_TOOL_REPAIR_EDIT()
 * @method static self TOOLVISU_TOOL_REPAIR_VIEW()
 *
 * @method static self TOOLVISU_PLANNED_ORDERS_EDIT()
 * @method static self TOOLVISU_PLANNED_ORDERS_VIEW()
 *
 * @method static self TOOLVISU_REPAIR_HISTORY_VIEW()
 *
 * @method static self TOOLVISU_ORDER_HISTORY_EDIT()
 * @method static self TOOLVISU_ORDER_HISTORY_VIEW()
 *
 * @method static self TOOLVISU_TOOL_OVERVIEW_VIEW()
 *
 * @method static self TOOLVISU_TOOL_SCHEDULE_VIEW()
 * @method static self TOOLVISU_TOOL_SCHEDULE_EDIT()
 *
 * @method static self TOOLVISU_SETTINGS_EDIT()
 * @method static self TOOLVISU_SETTINGS_VIEW()
 * 
 * 
 * **** MAINTENANCE ****************
 * @method static self MAINTENANCE_VIEW()
 * 
 * **** INTERFACE_MONITORING ****************
 * @method static self INTERFACE_MONITORING_VIEW()
 * @method static self DATA_EXPORTS_VIEW()
 * @method static self DATA_EXPORTS_EDIT()
 * @method static self COMMAND_SCHEDULES_EDIT()
 * @method static self COMMAND_SCHEDULES_VIEW()
 *
 * @method static self CLOSED_OPERATIONS_VIEW()
 * @method static self CLOSED_OPERATIONS_EDIT()
 * 
 *   **** TIMEVISU ****************
 * @method static self TIMEVISU_VIEW()
 * 
 * @method static self TIMEVISU_ADMIN()
 * 
 * @method static self TIMEVISU_TIME_RECORD_VIEW()
 * @method static self TIMEVISU_TIME_RECORD_EDIT()
 * 
 * @method static self TIMEVISU_REPORT_HOURS_TOOLVISU()
 * @method static self TIMEVISU_REPORT_HOURS_EMPLOYEE()
 * @method static self TIMEVISU_REPORTS_HOURS_PROJECTS()
 * 
 *   **** DOCVISU ****************
 * @method static self DOCVISU_VIEW()
 * @method static self DOCVISU_EDIT()
 * @method static self MACHINEBOARD_DOCVISU_EDIT()
 * @method static self MACHINEBOARD_DOCVISU_EDIT_IF_QUALIFIED()
 * 
 *   **** PERSONALVISU ****************
 * @method static self PERSONALVISU_VIEW()
 * @method static self PERSONALVISU_EDIT()
 * 
 *   **** SHIFTVISU ****************
 * @method static self SHIFTVISU_VIEW()
 * @method static self SHIFTVISU_ADMIN()
 * @method static self SHIFTVISU_ISSUE_CREATE()
 * 
 *   **** CRM ****************
 * @method static self CRM_VIEW()
 * 
 * @method static self CRM_CRM_PAGE_VIEW()
 * @method static self CRM_CRM_PAGE_EDIT()
 * 
 * @method static self CRM_SALES_FUNNEL_VIEW()
 * 
 * @method static self CRM_KANBAN_VIEW()
 * 
 * @method static self CRM_ACTIVITY_VIEW()
 * 
 * 
 * @method static self CRM_ACTION_REPORT_VIEW()
 * 
 *  **** QUALIVISU ****************
 * @method static self QUALIVISU_VIEW()
 * 
 * @method static self QUALIVISU_INSPECTION_POINT_VIEW()
 * @method static self QUALIVISU_INSPECTION_POINT_EDIT()
 * @method static self QUALIVISU_8D_REPORT_VIEW()
 * @method static self QUALIVISU_8D_REPORT_EDIT()
 * @method static self MACHINEBOARD_QUALIVISU_EDIT()
 * @method static self MACHINEBOARD_QUALIVISU_EDIT_IF_QUALIFIED()
 * 
 */
final class PermissionEnum extends Enum
{
}
