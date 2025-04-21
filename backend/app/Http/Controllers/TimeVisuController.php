<?php

namespace App\Http\Controllers;

use App\Models\UserRegisteredTime;
use App\Services\DateRangeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use PDF;
use Carbon\Carbon;
use DateTime;

class TimeVisuController extends Controller
{
    protected $dateRangeService;
    public function __construct(DateRangeService $dateRangeService)
    {
        $this->dateRangeService = $dateRangeService;
    }
    public function generateToolVisuReport(Request $request, $start, $end, $lang)
    {
        //TODO:: prod_orders->order_type->MAINTENANCE | Need to think about this one
        $client = env('CLIENT_NAME');
        $current_year = Carbon::parse($start)->year;
        $startOfYear = Carbon::createFromDate($current_year, 1, 1)->startOfDay();
        $endOfYear = Carbon::createFromDate($current_year, 12, 31)->endOfDay();

        $data = array();
        $filterDate = $this->dateRangeService->getFirstDateOfCurrentMonth(now());

        $yearHours = UserRegisteredTime::select(
            'items.custom_id as tool_nr',
            'items.name as tool_name',
            \DB::raw('SUM(user_registered_times.hours_split) as total_hours')
        )
        ->join('prod_order_pos_operations', 'prod_order_pos_operations.id', '=', 'user_registered_times.prod_order_pos_operation_id')
        ->join('prod_order_pos', 'prod_order_pos.id', '=', 'prod_order_pos_operations.prod_order_pos_id')
        ->join('prod_orders', 'prod_orders.id', '=', 'prod_order_pos.prod_order_id')
        ->join('items', 'items.id', '=', 'prod_order_pos.item_id')
        ->whereBetween('user_registered_times.date', [$startOfYear, $endOfYear])
        ->groupBy('items.custom_id', 'items.name')
        ->get()
        ->keyBy('tool_nr')
        ->toArray();
        // dd($yearHours);

        $response = UserRegisteredTime::select(
            'users.name as user_name',
            'machines.name as machine_name',
            'prod_orders.custom_id as order_name',
            'items.custom_id as tool_nr',
            'items.name as tool_name',
            'user_registered_times.hours_split as hours',
            'user_registered_times.date',
            'prod_order_pos_operations.name AS repair_name',
            'shifts.name AS shift_name'
        )->join('prod_order_pos_operations', 'prod_order_pos_operations.id', '=', 'user_registered_times.prod_order_pos_operation_id')
        ->join('prod_order_pos', 'prod_order_pos.id', '=', 'prod_order_pos_operations.prod_order_pos_id')
        ->join('prod_orders', 'prod_orders.id', '=', 'prod_order_pos.prod_order_id')
        ->join('items', 'items.id', '=', 'prod_order_pos.item_id')
        ->join('users', 'users.id', '=', 'user_registered_times.user_id')
        ->leftJoin('machines', 'machines.id', '=', 'user_registered_times.machine_id')
        ->leftJoin('shifts', 'shifts.id', '=', 'user_registered_times.shift_id')
        ->where('user_registered_times.date', '>=', $start)
        ->where('user_registered_times.date', '<=', $end)
        ->get()
        ->toArray();
        // dd($response);

        $toolData = collect($response)
        ->groupBy('tool_nr')
        ->map(function ($items) use ($yearHours) {
            $toolNr = $items->first()['tool_nr'];
            $toolName = $items->first()['tool_name'];
            return [
                'tool_nr' => $toolNr,
                'tool_name' =>  $toolName,
                'repair_names' => $items->pluck('repair_name')->unique()->filter()->implode(', '),
                'year_total_hour' => $yearHours[$toolNr]['total_hours'] ?? 0, // Map year total hours
                'table_data' => [
                    'sub_total_hours' => 0,
                    'entries' => []
                ]
            ];
        })
        ->values()
        ->toArray();

        foreach($response as $res) {
            foreach ($toolData as &$tool) {
                if ($res['tool_nr'] == $tool['tool_nr']) {
                    $res['activity'] = null;
                    $res['date'] = (new DateTime($res['date']))->format('d.m.Y');
                    $tool['table_data']['entries'][] = $res;
                    $tool['table_data']['sub_total_hours'] += $res['hours'] ?? 0;
                }
            }
        }
        $toolData = array_values($toolData);
        // dd($toolData);

        $data = array(
            'timevisu' => array(
                'start_date' => (new DateTime($start))->format('d.m.Y'),
                'end_date' => (new DateTime($end))->format('d.m.Y'),
                'year' => $current_year,
                'report_type' => 'toolvisu',
                'report_data' => $toolData,
            ),
        );
        // dd($data['timevisu']);

        try {
            $localeID = '';
            if($lang == 'en') $localeID = 'en-EN';
            elseif($lang == 'de') $localeID = 'de-DE';
            elseif($lang == 'it') $localeID = 'it-IT';
            elseif($lang == 'tr') $localeID = 'tr-TR';

            setlocale(LC_TIME, $localeID);
            $current_dateTime = new DateTime(now());
            $today = $current_dateTime->format('d.m.Y');
            $current_dateTime = $current_dateTime->format('d M Y H:i');
            $current_dateTime = ucwords(strftime("%d %B %Y %H:%M", strtotime($current_dateTime)));
            setlocale(LC_TIME, $localeID.".utf8");

            $reportHeader = trans('messages.timevisuReports.header.toolvisuReportTitle');
            $pageSettings = array(
                'main-details' => 'TimeVisu',
                'hasHeader' => true,
                'showHeaderTitle' => true,
                'applyHeaderBorder' => true,
                'header-title' => $reportHeader,
                'header-subTitle' => '',
                'showWaterMark' => true,
                'showScherTechLogo' => false,
                'showClientLogo' => true,
                'clientLogoUrl' => $client != 'DERGA' ? '/images/schertech-logo.png' : '/images/derga_logo.png',
                'showHeaderTitleTable' => false,
                'isCustomFooter' => false,
                'current_date' => $today,
                'current_time' => $current_dateTime,
                'showFooterImage' => false,
                'showFooterDetails' => false,
                'showSimpleFooter' => true,
                'showPoweredBy' => $client == 'DERGA' ? true : false,
                'pdfCreatedBy' => '',
                'pdfCheckedBy' => '',
                'pdfReleasedBy' => '',
                'pdfVersion' => 'V 1.0',
                'validity' => Carbon::now(),
                'location' => '',
                'footer_page_text' => trans('messages.pdfDetails.footer.page')
            );

            $pdf = PDF::setPaper('a4', 'portrait');
            $pdf->setOptions([
                'isPhpEnabled' => true,
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
                'isFontSubsettingEnabled' => true,
                'setIsTransparent' => true,
                'fontDir' => storage_path('fonts/'),
                'fontCache' => storage_path('fonts/'),
                'defaultFont' => 'Arial',
                'memory_limit' => '512M'
            ]);

            Log::info('PDF generation started');
   
            $pdf->loadView('index', ['pageSettings' => $pageSettings, 'viewData' => $data['timevisu']])->render();
            App::setLocale(config('app.locale'));

            // return $pdf->stream();
            return $pdf->download('timevisu-' . Carbon::now()->format('Y-m-d') . '-' . $reportHeader . '.pdf');
        } catch (\Throwable $th) {
            dd($th);
            Log::error($th);
        }
    }  
}
