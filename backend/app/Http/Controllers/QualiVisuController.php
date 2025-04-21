<?php

namespace App\Http\Controllers;

use App\Enums\EightDReport\EightDReportActionType;
use App\Enums\EightDReport\EightDReportIshikawaType;
use App\Enums\ProdInspectionOperationFrequency;
use App\Enums\ProdOrderPosOperationStatus;
use App\Models\EightDReport;
use App\Models\EightDReportAction;
use App\Models\EightDReportFiveWhy;
use App\Models\EightDReportIshikawa;
use App\Models\InspectionLot;
use App\Models\InspectionOperationCharacteristic;
use App\Models\InspectionPoint;
use App\Models\Plant;
use App\Models\ProdInspectionOperation;
use App\Models\ProdOrder;
use App\Models\ProdOrderPosOperation;
use App\Models\QualiEvent;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use ZipArchive;
use Exception;
use Storage;

class QualiVisuController extends Controller
{
    public function createInspectionPoint(ProdInspectionOperation $prodInspectionOperation)
    {
        return response($prodInspectionOperation->createInspectionPoint());
    }

    public function getInspectionsByOperation(Request $request)
    {
        $inspectionOperations = ProdInspectionOperation::with('inspectionPoints.inspectionPointCharacteristics.inspectionPointCharacteristicOptions', 'inspectionPoints.inspectionPointCharacteristics.lastModifiedBy','inspectionOperationCharacteristics','prodInspectionOperationResources.equipment')
                                ->whereHas('prodOrderPosOperation', function($query) {
                                    return $query->whereIn('status', [ProdOrderPosOperationStatus::IN_PRODUCTION(), ProdOrderPosOperationStatus::IN_SETUP(), ProdOrderPosOperationStatus::IN_TEARDOWN()]);
                                })
                                ->whereIn('prod_order_pos_operation_id', $request->input('prod_order_pos_operation_ids'))
                                ->orderBy('pos')
                                ->get();

        if(count($request->input('prod_order_pos_operation_ids'))) {
            $firstOperation = ProdOrderPosOperation::with(['prodOrderPos', 'prodOrderPos.prodOrder', 'prodOrderPos.prodOrder.plant'])->findOrFail($request->input('prod_order_pos_operation_ids')[0]);
            $qualivisu_block_threshold = $firstOperation?->prodOrderPos?->prodOrder?->plant?->qualivisu_block_threshold ?? 0;
            $registeredDateTimeCheck = now()->subSeconds($qualivisu_block_threshold);

            foreach ($inspectionOperations as $inspectionOperation) {
                foreach ($inspectionOperation->inspectionPoints as $inspectionPoint) {
                    if (!$inspectionPoint->isCompleted() && new Carbon($inspectionPoint->registered_datetime) < $registeredDateTimeCheck) {
                        return response()->json(['is_blocking' => true, 'inspection_operations' => $inspectionOperations]);
                    }
                }
            }
        }

        return response()->json(['is_blocking' => false, 'inspection_operations' => $inspectionOperations]);
    }

    public function getInspectionOperationCharacteristicDetails($prodInspectionOperation)
    {
        $result = ProdInspectionOperation::with('inspectionPoints.inspectionPointCharacteristics.inspectionPointCharacteristicOptions', 'prodOrderPosOperation.machine', 'prodOrderPosOperation.prodOrderPos.item', 'inspectionOperationCharacteristics.inspectionOperationCharacteristicOptions')->where('id', $prodInspectionOperation)->first();
        return response()->json(['inspectionOperationCharacteristics' => $result]);
    }

    public function getQualiEvents($machineId, $prodOrderPosOperationId) {
        $qualiEvents = QualiEvent::where('machine_id', $machineId)
                                ->where('prod_order_pos_operation_id', $prodOrderPosOperationId)
                                ->whereHas('prodOrderPosOperation', function ($query) {
                                    $query->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION());
                                })
                                ->get();
        return response()->json($qualiEvents);
    }

    public function updateTeamMembers(Request $request)
    {
        try {
            $eightDReportId = $request->reportId;


            $eightDReport = EightDReport::find($eightDReportId);



            if (!$eightDReport) {
                return response()->json([
                    'message' => 'Report not found.'
                ], 404);
            }

            if ($request->has('userIds')) {
                $eightDReport->team()->sync([]);
                $userIds = $request->userIds;
                $eightDReport->team()->sync($userIds);
            }

            return response()->json($eightDReport->team);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Update failed.',
                'errors' => $e->getMessage()
            ]);
        }
    }

    public function downloadEightDReports(Request $request)
    {
        if ($request->has('reportIds')) {
            $reportIds = $request['reportIds'];
        } else {
            return response("No Id provided");
        }

        $clientSideDateString = $request['clientSideDate'] ?? "";
        $clientSideDate = Carbon::parse($clientSideDateString)->format("M j, Y, g:i A");

        if (count($reportIds) == 1) {

            $data = $this->data8DReport($reportIds[0], $clientSideDate);

            if ($request->has('preview')) {

                return response()->view("quali-visu.eight-d-report", $data);
            }

            $pdf = PDF::loadView("quali-visu.eight-d-report", $data)->setPaper("a4", "portrait");

            $pdf->setOption('isPhpEnabled', true);

            return $pdf->stream(preg_replace('/[^a-zA-Z0-9.-]/', '_', substr($data['report']->title, 0, 25) . "_" . Carbon::parse($data['report']->created_at)->timestamp . ".pdf"));
        } else if (count($reportIds) > 1) {
            $zip = new ZipArchive();
            $zipFileName = 'Reports.zip';
            if ($zip->open(storage_path($zipFileName), ZipArchive::CREATE)) {
                foreach ($reportIds as $id) {
                    $data = $this->data8DReport($id, $clientSideDate);
                    $pdf = PDF::loadView("quali-visu.eight-d-report", $data)->setOption('isPhpEnabled', true)->output();

                    $zip->addFromString(preg_replace('/[^a-zA-Z0-9.-]/', '_', substr($data['report']->title, 0, 25) . "_" . Carbon::parse($data['report']->created_at)->timestamp . ".pdf"), $pdf);
                }
                $zip->close();
            }

            return response()->download(storage_path($zipFileName))->deleteFileAfterSend(true);

        }

    }

    public function data8DReport(int $reportId, string $clientSideDate)
    {

        $report = EightDReport::with([
            'supplier',
            'plant',
            'team.userGroup',
            'team',
            'author',
            'media' => function ($query) {
                $query->where('collection_name', 'default')->where('mime_type', 'LIKE', 'image/%');
            }
        ])->find($reportId);

        $actions = EightDReportAction::with(['responsible'])->where('eight_d_report_id', $report->id)->get();
        $immediate = $actions->where('action_type', EightDReportActionType::IMMEDIATE());
        $corrective = $actions->whereIn('action_type', [EightDReportActionType::CORRECTIVE(), EightDReportActionType::IMPLEMENTED()]);
        $implemented = $actions->where('action_type', EightDReportActionType::IMPLEMENTED());
        $preventative = $actions->where('action_type', EightDReportActionType::PREVENTIVE());
        $fiveW = EightDReportFiveWhy::where('eight_d_report_id', $report->id)->get();
        $ishikawa = EightDReportIshikawa::where('eight_d_report_id', $report->id)->get();
        $materials = $ishikawa->where('category', EightDReportIshikawaType::MATERIALS());
        $machines = $ishikawa->where('category', EightDReportIshikawaType::MACHINES());
        $measurement = $ishikawa->where('category', EightDReportIshikawaType::MEASUREMENT());
        $motherNature = $ishikawa->where('category', EightDReportIshikawaType::MOTHER_NATURE());
        $manpower = $ishikawa->where('category', EightDReportIshikawaType::MANPOWER());
        $methods = $ishikawa->where('category', EightDReportIshikawaType::METHODS());
        $attachments = $report->media;

        foreach ($attachments as $attachment) {
            $attachment['path'] = app(MediaController::class)->getMediaPath($attachment)->getData()->path ?? $attachment['original_url'];
        }

        $data = [
            "report" => $report,
            "immediate" => $immediate,
            "corrective" => $corrective,
            "implemented" => $implemented,
            "preventative" => $preventative,
            "fiveW" => $fiveW,
            "materials" => $materials,
            "machines" => $machines,
            "ishikawa" => $ishikawa,
            "measurement" => $measurement,
            "motherNature" => $motherNature,
            "manpower" => $manpower,
            "methods" => $methods,
            "attachments" => $attachments,
            "clientSideDate" => $clientSideDate
        ];

        return $data;
    }

    public function uploadSignature(Request $request, $reportId)
    {
        $reportId = $request->get('reportId');

        $media = EightDReport::find($reportId)->addMediaFromRequest('media')->toMediaCollection('signature');
        $media['path'] = app(MediaController::class)->getMediaPath($media)->getData()->path ?? $media['original_url'];
        return response($media);
    }

    public function getOpenInspectionPoints(Request $request, $userId)
    {
        $user = User::findOrFail($userId)->load('machines:id');
        $userAccessedMachineIds = $user->machines->pluck('id')->toArray() ?? [];
        $machineIds = $request->query('machineId') ? explode(',', $request->query('machineId')) : [];

        $mergedMachineIds = array_unique(array_merge($userAccessedMachineIds, $machineIds));

        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('perPage', 40);
        $userGroupIds = $request->query('userGroupId') ? explode(',', $request->query('userGroupId')) : [];
        $itemIds = $request->query('itemId') ? explode(',', $request->query('itemId')) : [];
        $search = $request->query('search');
        $isAll = $request->query('isAll', false);

        $inspectionPoints = InspectionPoint::with([
            'inspectable' => function ($query) {
                $query->with([
                    'prodOrderPosOperation.prodOrderPos.prodOrder' => fn($q) => $q->select('id', 'custom_id'),
                    'prodOrderPosOperation' => fn($q) => $q->select('id', 'prod_order_pos_id', 'machine_id', 'pos'),
                    'prodOrderPosOperation.prodOrderPos' => fn($q) => $q->select('id', 'item_id', 'prod_order_id'),
                    'prodOrderPosOperation.prodOrderPos.item' => fn($q) => $q->select('id', 'custom_id', 'name'),
                    'prodOrderPosOperation.machine' => fn($q) => $q->select('id', 'custom_id', 'name'),
                ])->select('id', 'prod_order_pos_operation_id', 'pos', 'is_active', 'frequency', 'name');
            },
            'inspectionPointCharacteristics' => fn($q) =>
                $q->select('id', 'inspection_point_id', 'inspection_operation_characteristic_id', 'value', 'user_id'),

            'inspectionPointCharacteristics.inspectionOperationCharacteristic' => fn($q) =>
                $q->select('id', 'characteristicable_type', 'characteristicable_id', 'pos', 'name', 'user_group_id', 'is_required', 'is_quantitative'),

            'inspectionPointCharacteristics.inspectionOperationCharacteristic.userGroup' => fn($q) =>
                $q->select('id', 'custom_id', 'name'),

            'inspectionPointCharacteristics.inspectionPointCharacteristicOptions'
        ])
            ->get()
            ->filter(function ($inspectionPoint) use($isAll) {
                return $isAll ? true :!$inspectionPoint->isCompleted();
            })
            ->filter(function ($inspectionPoint) use ($userGroupIds, $itemIds, $mergedMachineIds) {
                $operation = $inspectionPoint->inspectable->prodOrderPosOperation ?? null;
                $pos = $operation->prodOrderPos ?? null;

                // Filter by userGroupIds
                if (!empty($userGroupIds)) {
                    $matched = collect($inspectionPoint->inspectionPointCharacteristics)
                        ->pluck('inspectionOperationCharacteristic.user_group_id')
                        ->filter()
                        ->contains(fn($id) => in_array($id, $userGroupIds));

                    if (!$matched)
                        return false;
                }

                // Filter by itemIds
                if (!empty($itemIds) && !in_array($pos?->item_id, $itemIds))
                    return false;

                // Filter by machineIds
                if (!empty($mergedMachineIds) && !in_array($operation?->machine_id, $mergedMachineIds))
                    return false;

                return true;
            })
            ->filter(function ($inspectionPoint) use ($search) {
                if ($search) {
                    $searchTerm = strtolower($search);

                    $operation = $inspectionPoint?->inspectable?->prodOrderPosOperation ?? null;
                    $pos = $operation?->prodOrderPos ?? null;

                    $machine = $operation?->machine;
                    $item = $pos?->item;
                    $prodOrder = $pos?->prodOrder;

                    // Check for search term in the relevant fields
                    $matches = false;
                    if ($machine && (strpos(strtolower($machine->name), $searchTerm) !== false || strpos(strtolower($machine->custom_id), $searchTerm) !== false)) {
                        return true;
                    }

                    if ($item && (strpos(strtolower($item->name), $searchTerm) !== false || strpos(strtolower($item->custom_id), $searchTerm) !== false)) {
                        return true;
                    }
                    if ($prodOrder && (strpos(strtolower($prodOrder->custom_id), $searchTerm) !== false)) {
                        return true;
                    }
                    if ($operation && (strpos(strtolower($operation->pos), $searchTerm) !== false)) {
                        return true;
                    }

                    // Handle date parsing (DD.MM.YYYY or DD.MM.YYYY HH:MM)
                    $searchDate = null;
                    if (preg_match('/^\d{2}\.\d{2}\.\d{4}( \d{2}:\d{2})?$/', $search)) {
                        $dateTime = DateTime::createFromFormat('d.m.Y H:i', $search);
                        if (!$dateTime) {
                            $dateTime = DateTime::createFromFormat('d.m.Y', $search);
                        }

                        if ($dateTime) {
                            $searchDate = $dateTime->format(strlen($search) > 10 ? 'Y-m-d H:i' : 'Y-m-d');
                        }
                    }

                    if ($searchDate) {
                        $registered = $inspectionPoint->registered_datetime;
                        $registeredFormatted = Carbon::parse($registered)->format(strlen($searchDate) > 10 ? 'Y-m-d H:i' : 'Y-m-d');

                        if (strpos($registeredFormatted, $searchDate) === 0) {
                            return true;
                        }
                    }

                    // Check userGroup in inspectionPointCharacteristics (multiple items)
                    if ($inspectionPoint->inspectionPointCharacteristics) {
                        $matches = collect($inspectionPoint->inspectionPointCharacteristics)
                            ->contains(function ($characteristic) use ($searchTerm) {
                                $userGroup = $characteristic->inspectionOperationCharacteristic?->userGroup;
                                if ($userGroup) {
                                    return strpos(strtolower($userGroup->name), $searchTerm) !== false
                                        || strpos(strtolower($userGroup->custom_id), $searchTerm) !== false;
                                }
                                return false;
                            });
                    }

                    if ($matches)
                        return true;

                    return $matches;
                }

                return true; // If no search term, return true (no filtering by search)
            })
            ->values()
            ->sortBy('registered_datetime')
            ->map(function ($inspectionPoint) {
                $data = $inspectionPoint->toArray();
                $inspectable = $inspectionPoint->inspectable?->toArray() ?? [];

                return array_merge($data, [
                    'is_complete' => $inspectionPoint->isCompleted(),
                    'inspectable' => array_merge($inspectable, [
                        'inspection_points' => null,
                    ]),
                    'inspectionPointCharacteristics' => $data['inspection_point_characteristics'],
                    'inspection_point_characteristics' => null,
                ]);
            });

        // Paginate after filtering
        $result = $inspectionPoints->forPage($page, $perPage)->values();

        return response($result);
    }

}
