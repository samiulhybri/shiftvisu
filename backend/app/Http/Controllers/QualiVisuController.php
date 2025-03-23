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
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use ZipArchive;
use Exception;

class QualiVisuController extends Controller
{
    public function createInspectionPoint(ProdInspectionOperation $prodInspectionOperation)
    {
        return response($prodInspectionOperation->createInspectionPoint());
    }

    public function getInspectionsByOperation(Request $request)
    {
        $inspectionOperations = ProdInspectionOperation::with('inspectionPoints.inspectionPointCharacteristics.inspectionPointCharacteristicOptions', 'inspectionOperationCharacteristics','prodInspectionOperationResources.equipment')
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

        if (count($reportIds) == 1) {

            $data = $this->data8DReport($reportIds[0]);

            if ($request->has('preview')) {

                return response()->view("quali-visu.eight-d-report", $data);
            }

            $pdf = PDF::loadView("quali-visu.eight-d-report", $data)->setPaper("a4", "portrait");

            $pdf->setOption('isPhpEnabled', true);

            return $pdf->stream($data['report']->title . "_" . $data['report']->created_at . ".pdf");
        } else if (count($reportIds) > 1) {
            $zip = new ZipArchive();
            $zipFileName = 'Reports.zip';

            if ($zip->open(public_path($zipFileName), ZipArchive::CREATE)) {
                foreach ($reportIds as $id) {
                    $data = $this->data8DReport($id);
                    $pdf = PDF::loadView("quali-visu.eight-d-report", $data)->setOption('isPhpEnabled', true)->output();

                    $zip->addFromString(preg_replace('/[^a-zA-Z0-9.-]/', '_',$data['report']->title . " " . $data['report']->created_at . ".pdf"), $pdf);
                }
                $zip->close();
            }

            return response()->download(public_path($zipFileName))->deleteFileAfterSend(true);

        }

    }

    public function data8DReport(int $reportId)
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
        ];

        return $data;
    }

    public function uploadSignature(Request $request, $reportId)
    {
        $reportId = $request->get('reportId');

        $media = EightDReport::find($reportId)->addMediaFromRequest('media')->toMediaCollection('signature');
        return response($media);
    }
}
