<?php

use App\Enums\DataExportName;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Events\CastShotInserted;
use App\Events\ShopShotInserted;
use App\Events\MachineStatusChanged;
use App\Http\Controllers\AbsenceManagerMailController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\CallOffSimulationController;
use App\Http\Controllers\CapacityPlanController;
use App\Http\Controllers\CommandController;
use App\Http\Controllers\EnergyConsumptionReportController;
use App\Http\Controllers\Forklift;
use App\Http\Controllers\HandlingUnitController;
use App\Http\Controllers\HWEEvaluationsController;
use App\Http\Controllers\ImportFromBTPController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\MachineProdOrderPosOperationTimesController;
use App\Http\Controllers\MachineStateController;
use App\Http\Controllers\MachineUserRestrictionController;
use App\Http\Controllers\MaterialAnalysisController;
use App\Http\Controllers\MpOfferController;
use App\Http\Controllers\HWEKalk\MaterialNormController;
use App\Http\Controllers\NotificationGroupController;
use App\Http\Controllers\PlanVisuController;
use App\Http\Controllers\FurnaceTripPdfController;
use App\Http\Controllers\ProdOrderPosOperationController;
use App\Http\Controllers\QualiVisuController;
use App\Http\Controllers\QuantityController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ShiftVisu\ShiftVisuController;
use App\Http\Controllers\TransportOrderController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseOrderController;
use App\Http\Middleware\WithoutLimits;
use App\Models\DataExport;
use App\Models\Hall;
use App\Models\ProdOrderPosOperation;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MarkerRecipe\MarkerRecipeController;
use App\Http\Controllers\AbsenceManagerEventController;
use App\Http\Controllers\ADKExportController;
use App\Http\Controllers\DocVisu\DocVisuController;
use App\Http\Controllers\EnergyController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\InspectionPointController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ItemStatesController;
use App\Http\Controllers\MachineClockInController;
use App\Http\Controllers\MachineMachineStateTimeController;
use App\Http\Controllers\MachineCycleController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\OperationLogisticController;
use App\Http\Controllers\PackagingInstructionPosController;
use App\Http\Controllers\ProdOrderPosOperationLoadedQuantityController;
use App\Http\Controllers\QualificationController;
use App\Http\Controllers\RangeOverViewController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\TimeVisuController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::controller(PlanVisuController::class)->group(function () {
    Route::get('/plan_visu/get_active_halls', function () {
        return Hall::where('is_enabled_plan_visu', true)->get();
    });

    Route::get('/plan_visu/get_capacity/{hall}', 'getCapacity');
    Route::get('/plan_visu/get_demand/{hall}', 'getDemand');
    Route::get('/plan_visu/get_demand/{hall}/{simulation}', 'getSimulationDemand');
    Route::get('/plan_visu/get_backlog/{hall}', 'getBacklog');
    Route::get('/plan_visu/calculate_backlog', 'calculateBacklog');
    Route::get('/plan_visu/get_simulation_backlog/{hall}', 'getSimulationBacklog');
    Route::get('/plan_visu/get_call_offs', 'getCallOffs');
    Route::get('/plan_visu/get_bom_stock', 'getBomStock');
    Route::get('/plan_visu/get_sim_call_offs/{callOffSimulation}', 'getSimCallOffs');
    Route::patch('/sim_call_offs/{simCallOff}', 'updateSimCallOff');
    Route::post('/sim_call_offs', 'storeSimCallOff');
    Route::post('/plan_visu/calculate_end_date', 'calculateEndDate');
    Route::post('/plan_visu/export_prod_orders', 'exportProdOrders');
    Route::get('/plan_visu/get_user_capacity', 'getUserCapacity');
    Route::get('/plan_visu/get_machine_capacity', 'getMachineCapacity');
    Route::get('/plan_visu/get-demand-prod-order', 'getDemandProdOrder');
    Route::post('/plan_visu/create-orders', 'createNewOrders');
    Route::post('/plan_visu/user-capacity', 'getUserWithCapacity');
    Route::delete('/plan_visu/delete-user-plan-time/{planTime}', 'deleteUserPlanTime');
    Route::post('/plan_visu/user-scheduler/calendar', 'userSchedulerCalendar');
    Route::post('/plan_visu/get-machine-user-plan-times', 'getMachineUserPlanTimes');
    Route::get('/plan_visu/get_items_with_customer', 'getItemsWithCustomer');
    Route::get('/plan_visu/get_call_offs_with_customer', 'getCallOffsWithCustomer');
    Route::get('/plan_visu/running_tasks', 'getCurrentRunningTasks');
});

Route::controller(RangeOverViewController::class)->prefix('range-overview')->group(function () {
    Route::get('/range', 'getRangeOverview');
    Route::get('/plans', 'getOpearationQuantity');
});

Route::controller(ProdOrderPosOperationController::class)->group(function () {
    Route::get('/prod_order_pos_operation/get_prod_order_with_prod_lot/{hall}', 'getProdOrderWithProdLot');
    Route::get('/prod-order-pos-operation/time-record', 'getProdOrderPosOperationForTimeVisu');
    Route::post('/planned-operation', 'getPlannedOrder');
    Route::post('/update-constraint/{prodOrderPosOperationId}', 'updateConstrainedOperation');
    Route::post('/unplanned-operation', 'getUnPlannedOrder');
    Route::post('/machine-operation', 'getProdOrderPosOperationForMachines');
    Route::get('/operation-history-count', 'getMaintenanceHistoryCount');
    Route::post('/create-order/duration', 'getDurationForCreateOrder');
    Route::post('/plan_visu/constrainged_operation_date', 'getConstraingedOperationDate');
    Route::get('/get-orders', 'getOrdersForOrderView');
});

Route::controller(MaintenanceController::class)->prefix('maintenance')->middleware('auth:sanctum')->group(function () {
    Route::post('/create', 'createMaintenanceOrder');
    Route::patch('/update/{maintenancId}', 'updateMaintenanceOrder');
});

Route::get('/plan_visu/get_furnace_trip_pdf/{hall}', [FurnaceTripPdfController::class, 'download']);

Route::apiResource('call_off_simulations', CallOffSimulationController::class);

Route::controller(\App\Http\Controllers\SAPIdocImportController::class)->group(function () {
    Route::post('/import/sap/ecc', 'store')->withoutMiddleware("throttle:api");
    Route::post('/import/sap/dergasd/flow-monitor/handling-units', 'storeBen')->withoutMiddleware("throttle:api");
    Route::post('/import/sap/dergasd/flow-monitor/batches', 'storeBen')->withoutMiddleware("throttle:api");
    Route::post('/import/sap/dergasd/flow-monitor/production-orders', 'storeBen')->withoutMiddleware("throttle:api");
    Route::post('/import/sap/dergasd/flow-monitor/packaging-instructions', 'storeBen')->withoutMiddleware("throttle:api");
    Route::post('/import/sap/dergasd/flow-monitor/default-packaging-instructions', 'storeBen')->withoutMiddleware("throttle:api");
    Route::post('/import/sap/dergasd/flow-monitor/users', 'storeBen')->withoutMiddleware("throttle:api");
    Route::post('/import/sap/dergasd/flow-monitor/items', 'storeBen')->withoutMiddleware("throttle:api");
});

Route::controller(\App\Http\Controllers\CRMDataController::class)->group(function () {
    Route::get('/import/sales-opportunity', 'importSalesOpportunities');
    Route::post('/crm/import/exel-import', 'importExel');
    Route::get('/crm/action-data', 'actionDetails');
    Route::get('/crm/get-dates', 'getDates');
    Route::get('/crm/customer-log', 'getCustomerLogs');
});

Route::controller(\App\Http\Controllers\CustomerController::class)->group(function () {
    Route::get('/get-customer-data/{chatId}', 'getChatData');
    Route::get('/customer/backlog', 'getBacklog');
    Route::get('/customer/schedule', 'getCustomerSchedules');
});

Route::controller(\App\Http\Controllers\IdGeneratorController::class)->group(function () {
    Route::get('/generateId', 'generateIdRequest');
});

Route::controller(MpOfferController::class)
    ->middleware('auth:sanctum')
    ->group(function () {
        Route::post('/mp-offers', 'store');
        Route::post('/mp-offers/{offer}/duplicate', 'duplicate');
        Route::post('/mp-offers/{offer}/copy', 'copy');
        Route::post('/mp-offer-details/{id}/print/{lang}', 'generatePDF');
    });

Route::controller(MaterialNormController::class)->group(function () {
    Route::post('norm-chem-analyses/{isNew}', 'normsChemAnalyses');
});

Route::controller(MaterialAnalysisController::class)->group(function () {
    Route::post('material-analysis-chem-analyses/{isNew}', 'normsChemAnalyses');
});

Route::controller(EnergyConsumptionReportController::class)->group(function () {
    Route::get('/report_visu/consumption-data', 'consumptionData');
});

Route::controller(\App\Http\Controllers\MediaController::class)->group(function () {
    Route::post('/media/upload', 'uploadMedia');
    Route::get('/media/{media}/get-full-path', 'getMediaPath');
    Route::get('/media/{model}/{modelId}', 'get_model_image_paths');
    Route::post('/media/update/{modelId}', 'updateMediaSelection');
    Route::delete('/media/{media}', 'removeMedia');

    Route::get('/temporary-media/{media}', 'serveTemporaryMedia')->name('api.temporary.media')->middleware('signed');
});
Route::prefix('hwe-kalk')
    ->middleware('auth:sanctum')
    ->group(function () {
        Route::controller(\App\Http\Controllers\HWEKalk\OfferPosController::class)->group(function () {
            Route::post('/get-offer-pos', 'getOfferPos');
            Route::post('/offer-pos/copy', 'copyData');
            Route::post('/offer-pos-summary/{id}/pdf/{lang}/{isDownloadAllPos?}', 'generateSummaryPDF');
            Route::post('/ring-calculation', 'getRingCalculation');
        });
        Route::controller(\App\Http\Controllers\HWEKalk\HweKalkController::class)->group(function () {
            Route::get('/costs/block-price', 'getBlockPrice');
            Route::post('/materials/update-harden-ability-range-material', 'updateMaterialsForHardenAbilityRange');
            Route::post('/materials/update-material-analysis-material', 'updateMaterialsForMaterialAnalysis');
        });
        Route::controller(\App\Http\Controllers\HWEKalk\SalesOpportunityController::class)->group(function () {
            Route::get('/get/sales-opportunities', 'index');
            Route::post('/update-crm', 'updateCrm');
        });
        Route::controller(\App\Http\Controllers\HWEKalk\OfferController::class)
            ->group(function () {
                Route::post('/export-offer', 'exportOffer');
            });
        Route::controller(\App\Http\Controllers\HWEKalk\OperationPlanController::class)->group(function () {
            Route::post('/export-operation-plan', 'exportOperationPlan');
        });
        Route::controller(\App\Http\Controllers\HWEKalk\NonDestructiveNormController::class)->group(function () {
            Route::post('non-destructive-testing/create-update/morph/{nonDestructiveTesting}', 'createOrUpdateMorph');
            Route::get('non-destructive-testing/norm/{nonDestructiveNorm}', 'getNorm');
        });
        Route::controller(\App\Http\Controllers\HWEKalk\CalculationNonDestructiveNormController::class)->group(function () {
            Route::post('calculation-non-destructive-testing/create-update/morph/{calculationNonDestructiveTesting}', 'createOrUpdateMorph');
            Route::get('calculation-non-destructive-testing/norm/{calculationNonDestructiveNorm}', 'getNorm');
        });
        Route::controller(\App\Http\Controllers\HWEKalk\CalculationController::class)->group(function () {
            Route::post('/update-related-assessment', 'updateCalculationRelatedAssessments');
        });
    });
Route::prefix('hwe-qs')->group(function () {
    Route::controller(\App\Http\Controllers\HweQs\CertificateController::class)->group(function () {
        Route::post('/get-pdf/{certificate}/{lang}/{isText}', 'generatePdfOrText');
    });
})->withoutMiddleware('auth:sanctum');

Route::group(['middleware' => 'auth:sanctum'], function () {
    //All secure URL's
    Route::get("/logout", [UserController::class, 'logout']);
    Route::get("/getUserByToken", [UserController::class, 'getUserByToken']);
    Route::prefix('absence-manager')->group(function () {
        Route::controller(AbsenceManagerMailController::class)->group(function () {
            Route::post('/email/leave-request-approval/{lang}/{absenceRequest}', 'leaveRequestApproval');
            Route::post('/email/revoke-request-approval/{lang}/{absenceRequest}', 'revokeRequestApproval');
            Route::post('/email/leave-request-declination/{lang}/{absenceRequest}', 'leaveRequestDeclination');
            Route::post('/email/revoke-request-declination/{lang}/{absenceRequest}', 'revokeRequestDeclination');
            Route::post('/email/new-leave-request/{lang}/{absenceRequest}', 'newLeaveRequest');
            Route::post('/email/delete-leave-request/{lang}/{absenceRequest}', 'deleteLeaveRequest');
            Route::post('/email/revoke-leave-request/{lang}/{absenceRequest}', 'revokeLeaveRequest');
        });
        Route::controller(AbsenceManagerEventController::class)->group(function () {
            Route::post('/delete-calendar-event/{graphId}', 'deleteCalendarEvent');
            Route::post('/create-calendar-event/{lang}/{absenceRequestId}', 'createCalendarEvent');
        });
    });

    Route::controller(MachineController::class)->group(function () {
        Route::get('machines/{plant?}', 'getMachinesForStatusboard');
        Route::get('machines/item/{items}', 'getMachineByPlannedItem');
        Route::get('machines/order/{orders}', 'getMachineByPlannedOrder');
        Route::post('machines/{machine}/machine-machine-state-time', 'syncMachineMachineStateTime');
        Route::get('machines/{machineId}/machine-machine-state-time', 'getLastMachineStateTime');
        Route::get('machines/{machine}/machine-state-times', 'getCurrentMachineStates');
        Route::get('machine/{machine}/machine-current-state/{requestFrom?}', 'getMachineCurrentState');
        Route::get('machine/{machine}/qualification', 'getQualificationForChangingState');
        Route::get('machine/{machine}/machine-current-states', 'getCurrentStates');
        Route::get('machine/{machine}/start/{start}/end/{end}/machine-state-time-history', 'filterMachineStateTimesByDate');
        Route::post('machines/machine-machine-states', 'machineMachineStates');
        Route::post('machines/item-states-machine', 'itemStatesMachines');
        Route::get('machines/{machine}/check-qualified-clockin-users', 'checkQualifiedClockinUsers');
        Route::post('machines/section-activatable', 'handleSectionActivatable');
        Route::post('machines/machine-component-serial-number-profile', 'syncMachineComponentSerialNumberProfile');
        Route::post('machines/machine-last-serial-number-profile', 'syncMachineLastSerialNumberProfile');
        Route::post('machines/machine-middle-serial-number-profile', 'syncMachineMiddleSerialNumberProfile');
    });

    Route::controller(Forklift::class)->group(function () {
        Route::post('accept-order/', 'acceptOrder');
        Route::post('transport-done/', 'doneTransportation');
    });
    Route::post('/machine-clockin-clockout', [MachineClockInController::class, 'saveMachinesClockInClockOutTimeWithActivityType']);

    Route::prefix('logi-visu')->group(function () {
        Route::controller(TransportOrderController::class)->group(function () {
            Route::get('all-transport-orders/', 'getAllTransportOrders');
            Route::get('all-transport-order-count/', 'getAllTransportOrderCount');
            Route::post('accept-order/', 'acceptOrder');
            Route::post('transport-done/', 'doneTransportation');
            Route::post('decline-order/', 'declineOrder');
        });
    });
});

Route::post('/machine/save-machine-cycle-from-gateway', [MachineCycleController::class, 'saveMachineCycleFromGateway']);
Route::post('/machine/save-machine-state-from-gateway', [MachineMachineStateTimeController::class, 'saveMachineStateFromGateway']);
Route::get('/transport-order-pos/{orderId}', [TransportOrderController::class, 'getTransportOrderPos']);
Route::get('/machine/{machine}/{operation}/propose-transport-order-pos', [TransportOrderController::class, 'getProposeTransportOrderPos']);
Route::get('/machine/{machine}/{operation}/{packagingInstruction}/transport-order-pos-for-packaging', [TransportOrderController::class, 'getTransportOrderPosForPackaging']);

Route::prefix('energy')
    ->group(function () {
        Route::controller(EnergyController::class)
            ->group(function () {
                Route::post('/save-energy-consumption-from-gateway', 'saveConsumptionFromGateWay');
                Route::post('/save-energy-meter-reading-from-gateway', 'saveMeterReadingFromGateway');
            });
    });

Route::controller(UserController::class)
    ->withoutMiddleware("auth:sanctum")
    ->group(function () {
        Route::get("/user-ip", 'getUserIp');
        Route::post("/login", 'login');
        Route::post("/forget-password", 'getEmailForForgotPassword');
        Route::post("/reset-password", 'resetPassword');
        Route::post("/check-token-validation-for-reset-password", 'checkTokenValidationForResetPassword');
        Route::post("/auto-login", 'autoLogin');
        Route::post('/machine/save-machine-cycle', [MachineCycleController::class, 'saveMachineCycle']);
        Route::post('/machine/save-machine-cycle-from-device', [MachineCycleController::class, 'saveMachineCycleFromDevice']);
        Route::post('/machine/save-machine-state-from-device', [MachineMachineStateTimeController::class, 'saveMachineStateFromDevice']);
        Route::patch('/machine/{machine}/machine-state-time/{machineStateTime}', [MachineMachineStateTimeController::class, 'updateMachineStateId']);
        Route::prefix('event')->group(function () {
            Route::post('/cast-shot-inserted', function (Request $request) {
                CastShotInserted::dispatch($request);
            });
            Route::post('/shop-shot-inserted', function (Request $request) {
                ShopShotInserted::dispatch($request);
            });
            Route::post('/machine-status-changed', function (Request $request) {
                MachineStatusChanged::dispatch($request);
            });
        });
        // this api only for ADK export data from v10 to canias ERP
        Route::controller(ADKExportController::class)->group(function () {
            Route::post('/export/adk/operation-quantities', 'exportOperationQuantitiesToERP');
        });
    });


// castvisu permission sync endpoints for version 10 only
Route::post("castvisu/syncUserPermission", [UserController::class, 'syncCastVisuUserPermissionForV10']);
Route::post("user/manage-superVisor/{user}", [UserController::class, 'syncSuperVisor']);

# ToolVisu role permissions related apis
Route::controller(UserController::class)
    ->withoutMiddleware("throttle:api")
    ->prefix('toolvisu')
    ->group(function () {
        Route::get("/fetch-all-roles", 'fetchAllToolVisuRoles');
        Route::get("/users-with-roles", 'fetchToolVisuUsersRoles');
        Route::post("/update-role-per-user", 'updateToolVisuRolePerUser');
    });

# Time Visu (timevisu) Role Permissions related APIs
Route::controller(UserController::class)
    ->withoutMiddleware("throttle:api")
    ->prefix('timevisu')
    ->group(function () {
        Route::get("/fetch-all-roles", 'fetchAllTimeVisuRoles');
        Route::get("/users-with-roles", 'fetchTimeVisuUsersRoles');
        Route::post("/update-role-per-user", 'updateTimeVisuRolePerUser');
    });

# PlanVisu role permissions related APIS
Route::controller(UserController::class)
    ->withoutMiddleware("throttle:api")
    ->prefix('planvisu')
    ->group(function () {
        Route::get("/fetch-all-roles", 'fetchAllPlanVisuRoles');
        Route::get("/users-with-roles", 'fetchPlanVisuUsersRoles');
        Route::post("/update-role-per-user", 'updatePlanVisuRolePerUser');
    });

// user role endpoints
Route::get('/roles', [RoleController::class, 'index']);
Route::post('/roles', [RoleController::class, 'create']);
Route::patch('/roles/{role}', [RoleController::class, 'update']);
Route::delete('/roles/{role}', [RoleController::class, 'destroy']);

Route::controller(UserController::class)->group(function () {
    Route::post("/create-user", 'createUser');
    Route::get("/users", 'getUsers');
    Route::get("/userCount", 'getUserCount');
    Route::put("/user/{user}", 'updateUser');
});

Route::controller(ChatController::class)
    ->middleware('auth:sanctum')
    ->prefix('chat')
    ->group(
        function () {
            Route::get('/chats', 'getChats');
            Route::get('/available_users', 'getAvailableUsers');
            Route::get('/available_modules', 'getAvailableModules');
            Route::get('/{chat}/messages', 'getMessages');
            Route::get('/message/{message}', 'getMessageDetail');
            Route::get('/chat/{chat}', 'getChatDetail');
            Route::post('/{chat}/send_message', 'sendMessage');
            Route::patch('/edit_message/{message}', 'editMessage');
            Route::delete('/delete_message/{message}', 'deleteMessage');
            Route::post('/start_chat/{chat_partner}', 'startChat');
            Route::post('/start_group_chat', 'startGroupChat');
            Route::post('/register_fcm_token', 'registerFcmToken');
            Route::patch('/mark_as_read/{message}', 'markAsRead');
            Route::patch('/{chat}/leave_chat', 'leaveChat');
            Route::patch('/{chat}/add_user/{user}', 'addUserToChat');
            Route::patch('/{chat}/remove_user/{user}', 'removeUserFromChat');
            Route::get('download_attachment/{mediaItem}', 'downloadAttachment');
        }
    );

Route::prefix('marker-recipe')->group(function () {
    Route::controller(MarkerRecipeController::class)->group(function () {
        Route::get('/send-marker-recipe/{markerRecipe}', 'sendMarkerRecipe');
        Route::post('/save-pos', 'savePos');
        Route::post('/delete-pos/{id}', 'deletePos');
        Route::post('/save-block', 'saveBlock');
        Route::post('/delete-block/{id}', 'deleteBlock');
        Route::get('/request-pcc/{ipPCC}/data', 'requestDataPcc');
        Route::get('/request-pcc/{ipPCC}/send-data-to-printer', 'sendDatatoPrinter');
        Route::get('/request-pcc/{ipPCC}/set-order-counter/{count}', 'setOrderCounter');
        Route::get('/request-pcc/{ipPCC}/set-day-counter/{count}', 'setDayCounter');
        Route::post('/copy-recipe/{id}', 'copyRecipe');
    });
});

Route::prefix('capacity-plan')->controller(CapacityPlanController::class)->group(function () {
    Route::post('/store', 'store');
    Route::post('/create-capacity', 'createCapacityForShiftModel');
    Route::put('/update-capacity', 'updateCapacityForShiftModel');
    Route::get('/machine/{machine}/re-schedule', 'getCapacityForAllOperations');
    Route::get('/{type}/{id}/{year}', 'getCapacity');

    // Machine clock in shift endpoint
    Route::get('/clockin/shift/{machineId}/{additionalMinute?}', 'getMachineClockInShift');
    Route::get('/machine/{machine}', 'getCapacityForOperation');
    Route::get('/start/{machine}', 'getCapacityForOperationEndTime');
});

Route::prefix('base-visu')->group(function () {
    Route::controller(MachineStateController::class)->group(function () {
        Route::post('/machine-machine-states', 'machineMachineState');
    });

    Route::controller(ItemStatesController::class)->group(function () {
        Route::post('/bad-part-reasons-machines', 'itemStatesMachines');
    });

    Route::controller(MachineUserRestrictionController::class)->group(function () {
        Route::post('/machine-user-restriction', 'machineUserRestriction');
    });
});

Route::controller(\App\Http\Controllers\BaseDataImportController::class)
    ->middleware('auth:custom')
    ->middleware(WithoutLimits::class)
    ->prefix('import')
    ->group(function () {
        Route::get('/tpm-groups', 'tpmGroupsSync');
        Route::get('/tpm-sub-groups', 'tpmSubGroupsSync');
        Route::get('/machines', 'machinesSync');
        Route::get('/departments', 'departmentsSync');

        Route::get('/items', 'itemsSync');
        Route::get('/item-groups', 'itemGroupsSync');
        Route::get('/tools', 'toolsSync');
        Route::get('/users', 'usersSync');

        Route::get('/user-groups', 'userGroupsSync');
        Route::get('/halls', 'hallsSync');
        Route::get('/resource-groups', 'resourceGroupsSync');

        Route::post('/prod-orders/{prodOrderCustomId?}/{needJpiImport?}', 'prodOrdersSync');
    });

Route::prefix('jpi')
    ->middleware(WithoutLimits::class)
    ->controller(\App\Http\Controllers\JpiController::class)->group(function () {
        Route::post('/upload-base-data', 'uploadBaseData');
        Route::post('/upload-order-data', 'uploadOrderData');
        Route::post('/upload-order-progress', 'uploadOrderProgress');
        Route::post('/upload-order-progress-prepared', 'uploadOrderPreparedProgress');
        Route::post('/download-planning-data', 'downloadPlanningData');
    });
Route::prefix('kpis')->controller(\App\Http\Controllers\KpiController::class)->group(function () {
    Route::post('/machines/{machineId}/kpi', 'getKpiValues');
});
Route::prefix('production-plan')->controller(\App\Http\Controllers\ProductionPlanController::class)->group(function () {
    Route::get('/get-production-plan/{machine}', 'getProductionPlan');
    Route::get('/get-production-count/{machine}', 'getStatusWiseCount');
    Route::post('/update-operation-status', 'updateOperationStatus');
    Route::post('/update-operation-time-status', 'updateOperationTimeStatus');
    Route::post('/link-production', 'getLinkAndProduction');
    Route::post('/can-change-state-of-operations', 'canChangeStatusOfOperation');
    Route::post('/{machine}/{prodOrderPosOperation}/print', 'printProductionPlan');
});

Route::prefix('doc-visu')
    ->middleware('auth:sanctum')
    ->controller(DocVisuController::class)
    ->group(function () {

        Route::prefix('document-sections')->group(function () {
            Route::get('/', 'getAllDocumentSections');
        });

        Route::prefix('directory-structures')->group(function () {
            Route::post('/', 'createProcess');
            Route::get('/', 'getAllDirectoryStructures');
            Route::get('/{structureId}', 'getStructureDetails');
        });

        Route::prefix('files')->group(function () {
            Route::get('/{fileId}', 'getDocVisuFile');
            Route::post('/', 'createDocVisuFile');
            Route::post('/{fileId}/media', 'uploadDocVisuFileMedia');
            Route::post('/{fileId}/notes', 'createDocVisuFileNotes');
            Route::patch('/{fileId}', 'updateDocVisuFile');
            Route::delete('/{docVisuFile}', 'deleteDocVisuFile');
        });

        Route::prefix('linking')->group(function () {
            Route::post('/', 'linkedToDirectory');
        });
    });

Route::prefix('machine-board')->group(function () {
    Route::controller(MachineProdOrderPosOperationTimesController::class)->group(function () {
        Route::get('machine-production-quantity-chart/{machine_id}', 'getMachineProductionQuantityChart');
        Route::post('/next-packaging', 'setNextPackaging');
        Route::get('/next-packaging-instruction/{operation}', 'getNextPackagingInstructions');
        Route::get('/{machineId}/{operation}/remaining-quantity', 'remainingQuantityForPackaging');
    });

    Route::controller(ProdOrderPosOperationController::class)->group(function () {
        Route::post('/operation-details', 'getOperationDetails');
        Route::patch('/close-operation/{prodOrderPosOperation}', 'closeProdOrderPosOperation');
    });

    Route::controller(OperationLogisticController::class)->group(function () {
        Route::get('operation-logistic/{machine}/operation/{operation_id}/item/{item_id}', 'getOperationLogisticChanges');
    });
});

Route::prefix('stock')
    ->middleware('auth:sanctum')
    ->controller(StockController::class)->group(function () {
        Route::get('/scan-stock-for-transport-order', 'getStocksForTransportOrder');
        Route::get('/stocks', 'getStocks');
        Route::put('/update-stock', 'storeOrUpdateStocks');
        Route::get('/get-handling-unit-hierarchy/{handlingUnit}', 'getHandlingUnitHierarchy');
        Route::get('/{machineId}/stocks', 'getStocksMachineSpecific');
        Route::get('/{itemPlantId}/get-stocks-for-item-plant', 'getStocksForItemPlant');
        Route::post('/{machine}/{operation}/scanned-handling-unit-for-exit', 'scanHandlingUnitForExit');
        Route::get('/{machine}/check-bom-for-scanned-text', 'checkBomForScannedText');
        Route::get('/{machine}/check-exit-for-operations', 'checkExitForOperations');
        Route::get('/{machineId}/packaging/stocks', 'getMachineSpecificPackagingStocks');
        Route::post('/{machine}/{operation}/{stock}/unlink-production-supply-area-for-exit', 'unlinkProductionSupplyAreaForExit');
        Route::get('/{machineId}/packaging/handling-units', 'getMachineSpecificPackagingHandlingUnits');
        Route::get('/{prodOrderPosOpId}/stocks/handling-units', 'getOperationSpecificHandlingUnits');
        Route::get('/{prodOrderPosOperation}/total-quantity', 'getTotalStocksQuantity');
        Route::get('/{machine}/production-supply-area', 'getStocksForProductionSupplyArea');
        Route::post('/{machine}/{operation}/{stock}/unlink-production-supply-area-for-entry', 'unlinkProductionSupplyAreaForEntry');
        Route::post('/{machine}/{operation}/{stock}/scrap', 'scrapStock');
    });

Route::prefix('quantity')
    ->middleware('auth:sanctum')
    ->controller(QuantityController::class)->group(function () {
        Route::post('/suspend-serials', 'suspendSerials');
        Route::get('/{machine}', 'getQuantity');
        Route::post('/{machine}/insert-quantity', 'insertQuantity');
        Route::post('/{machine}/get-iiot-details', 'proposedIiotQuantitiesDetails');
        Route::post('/propose_consumptions/{machine}/{operation}', 'proposeConsumptionWithData');
        Route::post('/create_goods_receipt/{machine}', 'createGoodsReceipt');
        Route::post('/reset_machine_cycles/{machine}', 'resetMachineCycles');
        Route::post('/scan/handling-unit', 'scanHandlingUnitForQuantity');
        Route::get('/maximum-quantity/{operationId}/{itemId}', 'maximumQuantity');
        Route::get('/v10/{prodOrderPosOperationIds}', 'getQuaitityFromv10');
    });

Route::withoutMiddleware("auth:sanctum")->post('import-from-btp', [ImportFromBTPController::class, 'getImportedValuesFromBTP']);
Route::get('import-image-from-btp/{itemIdCustom}', [ImportFromBTPController::class, 'getImportedImageFromBTP']);
Route::get('import-attachment-from-btp/{prodInspectionOperationResource}', [ImportFromBTPController::class, 'getAttachmentFromBTP']);

Route::middleware('auth:sanctum')->get('/packaging-instruction-pos', [PackagingInstructionPosController::class, 'getPackagingInstructionPos']);
Route::middleware('auth:sanctum')->get('/painting-line-loaded-quantity/{machine}/{operation}', [ProdOrderPosOperationLoadedQuantityController::class, 'getMachineAndOperationSpecificLoadedQuantity']);
Route::middleware('auth:sanctum')->post('/painting-line-loaded-quantity', [ProdOrderPosOperationLoadedQuantityController::class, 'saveLoadedQuantity']);
Route::middleware('auth:sanctum')->get('/unloaded-quantity/{machine}', [ProdOrderPosOperationLoadedQuantityController::class, 'getMachineSpecificUnloadingQuantity']);
Route::middleware('auth:sanctum')->post('/painting-line-unload-quantity', [ProdOrderPosOperationLoadedQuantityController::class, 'saveUnloadedQuantity']);
Route::middleware('auth:sanctum')->put('/painting-line-unload-quantity-manual/machine/{machine}/operation/{operation}', [ProdOrderPosOperationLoadedQuantityController::class, 'updateLoadedFlag']);
Route::controller(QualificationController::class)->group(function () {
    Route::post('base-visu/qualification-user', 'qualificationUsers');
    Route::get('machines/{machine}/qualified-clockin-users', 'getQualifiedClockinUsers');
});

Route::controller(NotificationGroupController::class)->group(function () {
    Route::post('base-visu/notification-group-user', 'syncNotificationGroupUsers');
});

Route::get('/evaluation', [HWEEvaluationsController::class, 'getEvaluations']);
Route::get('/evaluation-excel', [HWEEvaluationsController::class, 'generateExcel']);

Route::prefix('export')
    ->middleware('auth:sanctum')->group(function () {
        Route::controller(ExportController::class)->group(function () {
            Route::post('/{dataExport}', 'singleExport');
        });
    });

Route::post("/commands/run/calculate-workload", [CommandController::class, 'calculateWorkload']);
Route::post("/commands/run/{command}", [CommandController::class, 'runCommand']);



Route::post("/operations/{operation}/plan/{isUnRelesedOperation?}", function (ProdOrderPosOperation $operation, $isUnRelesedOperation = 1) {
    $prodOrder = $operation->prodOrderPos->prodOrder;

    $data = [
        'custom_id' => $prodOrder->custom_id,
        'order_type' => $prodOrder->order_type,
        'pos' => collect([]),
    ];

    if ($operation->status == ProdOrderPosOperationStatus::PLANNED() && $isUnRelesedOperation) {
        $operation->status = ProdOrderPosOperationStatus::TERMINATED();
        $operation->status_plan = ProdOrderPosOperationStatus::TERMINATED();
        $operation->save();
    }

    foreach ($prodOrder->prodOrderPos()->where('prod_order_pos.status', '<>', ProdOrderPosStatus::DELETED())->get() as $prodOrderPos) {
        $pos = [
            'pos' => $prodOrderPos->pos,
            'quantity' => $prodOrderPos->quantity,
            'opPlanPos' => collect([]),
        ];
        foreach ($prodOrderPos->prodOrderPosOperations()->where('status', '<>', ProdOrderPosOperationStatus::DELETED())->get() as $prodOrderPosOperation) {

            $opPlanPos = [
                'pos' => $prodOrderPosOperation->pos,
                'name' => $prodOrderPosOperation->name,
                'start' => $prodOrderPosOperation->start,
                'end' => $prodOrderPosOperation->end,
                'te' => $prodOrderPosOperation->te,
                'cavity' => $prodOrderPosOperation->cavity,
                'operation_code' => $prodOrderPosOperation->operation_code,
                'operation_code_erp' => $prodOrderPosOperation->operation_code_erp,
                'status' => $prodOrderPosOperation->status,
                'status_erp' => $prodOrderPosOperation->status_erp,
                'machine_custom_id' => $prodOrderPosOperation->machine->custom_id ?? '',
                'is_enabled_plan_visu' => (bool) ($prodOrderPosOperation->machine?->sectionActivatables()->where('section', 'PLANVISU')->get()->first()?->is_active ?? false),
                'tool_custom_id' => $prodOrderPosOperation->tool->custom_id ?? '',
                'hall_custom_id' => $prodOrderPosOperation->machine->hall->custom_id ?? '',
                'tool_reference_nr' => $prodOrderPosOperation->tool_reference_nr ?? null,
                'tool_reference_nr_erp' => $prodOrderPosOperation->tool_reference_nr_erp ?? null
            ];
            $pos['opPlanPos']->push($opPlanPos);
        }
        $data['pos']->push($pos);
    }

    $now = now();
    $dataExport = DataExport::create([
        'name' => DataExportName::PRODUCTION_ORDER(),
        'data' => json_encode($data),
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $c = new ExportController();
    $exportResponse = $c->singleExport($dataExport);

    if ($exportResponse->is_exported ?? 0) {
        // update operation_code_erp to the new one from schertech 
        if ($operation->operation_code_erp != $operation->operation_code) {
            $operation->operation_code_erp = $operation->operation_code;
        }
        // update tool_reference_nr_erp to the new one from schertech 
        if ($operation->tool_reference_nr != null && $operation->tool_reference_nr_erp != $operation->tool_reference_nr) {
            $operation->tool_reference_nr_erp = $operation->tool_reference_nr;
        }
        // update status_erp to the new one from schertech
        if ($operation->status != $operation->status_erp) {
            $operation->status_erp = $operation->status;
        }
        $operation->save();

        //sleep for 10 seconds
        sleep(10);
        Artisan::call('import_dto:prodorder', [
            'custom_id' => $prodOrder->custom_id
        ]);
    }

    return response('ok');
});

Route::get("/warehouse/{operation}/{handlingUnit}/print", [HandlingUnitController::class, 'printHandlingUnit']);
Route::middleware(['auth:sanctum', WithoutLimits::class])->post("/scheduled-commands/{command}", [CommandController::class, 'runCommand'])->can('COMMAND_SCHEDULES_EDIT');

Route::post('/warehouse/{operation}/create-tasks', [WarehouseOrderController::class, 'createTasks']);
Route::post('/warehouse/{operation}/create-cross-order-tasks', [WarehouseOrderController::class, 'createCrossOrderTasks']);

Route::prefix('items')
    ->middleware('auth:sanctum')
    ->group(function () {
        Route::controller(ItemController::class)->group(function () {
            Route::post('/{id}/tool-repair-status', 'getToolRepairStatuses');
            Route::post('/{id}/tool-repair-production-date', 'updateRepairProductionDate');
            Route::post('/update-customers-for-item/{id}', 'updateCustomersForEachItem');
        });
    });

Route::prefix('areas')
    ->middleware('auth:sanctum')->group(function () {
        Route::controller(AreaController::class)->group(function () {
            Route::post('/{area}/sync', 'syncOrAttachUsers');
        });
    });

Route::prefix('shift-visu')->controller(ShiftVisuController::class)->group(function () {
    Route::post('/issue-type', 'createIssueType');
    Route::patch('/issue-type/{id}', 'updateIssueType');
    Route::post('/component-model-type', 'updateComponentModelType');
});

Route::prefix('quali-visu')->controller(QualiVisuController::class)->group(function () {
    Route::post('/prod-inspection-operation/{prodInspectionOperation}/create-inspection-point', 'createInspectionPoint');
    Route::post('/get-inspections-by-operations', 'getInspectionsByOperation');
    Route::get('/get-inspection-operation-characteristic-details/{prodInspectionOperation}', 'getInspectionOperationCharacteristicDetails');
    Route::get('/get-quali-events/{machineId}/{prodOrderPosOperationId}','getQualiEvents');
    Route::post('/{reportId}/team-members','updateTeamMembers');
    Route::post('/{reportId}/upload-signature', 'uploadSignature');
    Route::post('/eight-d-report/download', 'downloadEightDReports');
});

Route::prefix('inspection-point')->controller(InspectionPointController::class)->group(function () {
    Route::get('/get-inspection-points/{inspectionOperationId}', 'getInspectionPoints');
    Route::get('/get-inspection-point-details/{prodInspectionOperation}/{inspectionPoint}', 'getInspectionPointDetails');
    Route::post('/update-inspection-point', 'updateInspectionPoint');
    Route::delete('/delete/{inspectionPoint}', 'delete');
});

Route::prefix('time-visu')->controller(TimeVisuController::class)->group(function () {
    Route::get('/report/tool-visu-hour/{start}/{end}/{lang}/{client}', "generateToolVisuReport");
});
