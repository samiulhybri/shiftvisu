<?php

namespace App\Http\Controllers;

use App\Enums\ReportRangeGeneratorType;
use Illuminate\Support\Facades\DB;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Artisan;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Customer;
use App\Models\Contact;
use App\Http\Controllers\IdGeneratorController;
use App\Models\CrmAction;
use App\Models\CustomerCrmActionLog;
use App\Models\MarketSegment;
use App\Services\DateFormatService;
use App\Services\DateRangeService;
use Carbon\Carbon;
use DateTime;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Date;
use PDO;
use Illuminate\Support\Facades\Log;


class CRMDataController extends Controller
{
    protected $dateRangeService;

    public function __construct(DateRangeService $dateRangeService)
    {
        $this->dateRangeService = $dateRangeService;
    }

    public function importSalesOpportunities()
    {
        $result = Artisan::call('import:opportunity');

        abort_unless($result == 1, 500, "Sales opportunity import failed");
        return response()->json(['msg' => 'Sales opportunity imported successfully']);
    }

    public function importExel(Request $request)
    {
        $filePath1 = $request->file('file1');
        $filePath2 = $request->file('file2');

        $customerData = Excel::toArray([], $filePath1);
        $customerHeaders = array_shift($customerData[0]);

        $contactData = Excel::toArray([], $filePath2);
        $contactHeaders = array_shift($contactData[0]);

        $filteredCustomerRows = array_filter($customerData[0], function ($row) {
            return array_filter($row); // Removes rows where all values are null/empty
        });
        // Map to associative array
        $formattedCustomerData = array_map(function ($row) use ($customerHeaders) {
            return array_combine($customerHeaders, $row);
        }, $filteredCustomerRows);
        $filteredContactRows = array_filter($contactData[0], function ($row) {
            return array_filter($row); // Removes rows where all values are null/empty
        });
        // Map to associative array
        $formattedContactData = array_map(function ($row) use ($contactHeaders) {
            return array_combine($contactHeaders, $row);
        }, $filteredContactRows);
        $chunkSize = env('DATA_CHUNK_SIZE', 100);
        try {
            DB::beginTransaction();
            $duplicates = [];
            $chunksOfCustomerData = array_chunk($formattedCustomerData, $chunkSize);
            foreach ($chunksOfCustomerData as $chunkOfCustomerData) {
                foreach ($chunkOfCustomerData as $index => $customerData) {
                    $existingCustomer = Customer::where('custom_id', $customerData['ID'])->first();
                    if ($existingCustomer) {
                        $duplicates[] = "custom_id={$customerData['ID']}, Name={$customerData['Firmenname']}";
                    } else {
                        $countryId = DB::table('countries')
                            ->where('name', $customerData['Land'])
                            ->value('id');

                        $employeeClassificationId = DB::table('employee_classifications')
                            ->where('custom_id', $customerData['Mitarbeiterzahl'])
                            ->value('id');

                        $revenueClassificationId = DB::table('revenue_classifications')
                            ->where('custom_id', $customerData['Umsatz'])
                            ->value('id');

                        $marketSegmentId = DB::table('market_segments')
                            ->where('custom_id', $customerData['Market Segment'])
                            ->value('id');

                        Customer::insert(
                            [
                                'custom_id' => $customerData['ID'],
                                'name' => $customerData['Firmenname'],
                                'address' => $customerData['Straße & Hausnummer'],
                                'city' => $customerData['Ort'],
                                'postal_code' => $customerData['PLZ'],
                                'country_id' => $countryId,
                                'country_code' => $customerData['Ländercode'],
                                'email' => $customerData['E-Mail-Adresse'],
                                'telephone' => $customerData['Telefonnummer'],
                                'website' => $customerData['Webseite'],
                                'employee_classification_id' => $employeeClassificationId,
                                'revenue_classification_id' => $revenueClassificationId,
                                'market_segment_id' => $marketSegmentId,
                                'linkeldn' => $customerData['LinkedIn Account'],
                                'wz_codes' => $customerData['WZ-Codes'],
                                'branch_1' => $customerData['Branche (Hauptkategorie)'],
                                'branch_2' => $customerData['Branche (Unterkategorie)'],
                                'sales_status_id' => 2,
                                'is_active' => 1,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]
                        );
                    }
                }
            }

            // Handle contacts
            $chunksOfContactData = array_chunk($formattedContactData, $chunkSize);
            foreach ($chunksOfContactData as $chunkOfContactData) {
                foreach ($chunkOfContactData as $index => $contactData) {
                    $contactId = DB::table('contacts')->insertGetId([
                        'salutation' => $contactData['Anrede'],
                        'title' => $contactData['Titel'],
                        'first_name' => $contactData['Vorname'],
                        'last_name' => $contactData['Nachname'],
                        'role_description' => $contactData['Jobtitel'],
                        'dept_name' => $contactData['Abteilung'],
                        'telephone' => $contactData['Telefonnummer'],
                        'mobile' => $contactData['Handynummer'],
                        'email' => $contactData['E-Mail-Adresse'],
                        'linkedin' => $contactData['LinkedIn Account'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    // Get associated customer ID
                    $customerId = DB::table('customers')
                        ->where('custom_id', $contactData['Firmen-ID'])
                        ->value('id');

                    // Link contact to customer
                    DB::table('contactable_contacts')->insert([
                        'contactable_type' => 'App\Models\Customer',
                        'contactable_id' => $customerId,
                        'contact_id' => $contactId,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
            if (!empty($duplicates)) {
                Log::channel('crm_excel_import')->info(json_encode($duplicates));
            }
            DB::commit();
            return response()->json(['success' => 'Data inserted successfully!']);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Transaction failed!', 'details' => $e->getMessage()]);
        }
    }

    public function getCustomerLogs(Request $request)
    {
        $limit = 1000;
        $offset = 0;
        $userIds = array_filter(array_map('intval', explode(',', $request->query('user_ids', ''))));
        $actionIds = array_filter(array_map('intval', explode(',', $request->query('action_ids', ''))));
        $countryIds = array_filter(array_map('intval', explode(',', $request->query('country_ids', ''))));

        $logsQuery = DB::table('customer_crm_action_logs')
            ->join('crm_actions', 'customer_crm_action_logs.crm_action_id', '=', 'crm_actions.id')
            ->join('users', 'customer_crm_action_logs.user_id', '=', 'users.id')
            ->join('customers', 'customer_crm_action_logs.customer_id', '=', 'customers.id')
            ->join('countries', 'customers.country_id', '=', 'countries.id')
            ->select([
                'customers.name as customer',
                'customer_crm_action_logs.crm_action_id as id',
                'customer_crm_action_logs.log_date as log_date',
                'crm_actions.name as Action',
                'customer_crm_action_logs.note as Note',
                'users.name as user',
                'customer_crm_action_logs.user_id as user_id',
                'customer_crm_action_logs.customer_id as customer_id',
                'customer_crm_action_logs.crm_action_id as crm_action_id',
                DB::raw('WEEK(customer_crm_action_logs.log_date, 3) as WEEK'),
                'customers.name as customer_name',
                'countries.name as country_name'
            ])
            ->when(count($userIds) > 0, function ($query) use ($userIds) {
                return $query->whereIn('customer_crm_action_logs.user_id', $userIds);
            })
            ->when(count($actionIds) > 0, function ($query) use ($actionIds) {
                return $query->whereIn('customer_crm_action_logs.crm_action_id', $actionIds);
            })
            ->when(count($countryIds) > 0, function ($query) use ($countryIds) {
                return $query->whereIn('customers.country_id', $countryIds);
            })
            ->orderBy('customer_crm_action_logs.log_date', 'desc')
            ->skip($offset)
            ->take($limit);
        return response()->json($logsQuery->get());
    }



    public function actionDetails(Request $request)
    {
        // Initialize date variables
        $startDate = now();
        $endDate = now();

        // Initialize DateFormatService
        $table = 'customer_crm_action_logs';
        $column = 'log_date';
        $dateFormatService = new DateFormatService();

        // Get date-related functions
        $dateFunction = $dateFormatService->getDateFormat($table, $column);
        $weekFunction = $dateFormatService->getWeekFormat($table, $column);
        $weekYearFunction = $dateFormatService->getWeekYearFormat($table, $column);
        $monthFunction = $dateFormatService->getMonthFormat($table, $column);
        $monthYearFunction = $dateFormatService->getMonthYearFormat($table, $column);

        // Get date range type and count
        $dateRangeType = ReportRangeGeneratorType::from($request->input('date_range_type', ReportRangeGeneratorType::DAY->value));
        $count = $request->input('count', 12);

        // Generate date ranges
        $dateRanges = $this->dateRangeService->generateDateRanges($endDate, $dateRangeType, $count);
        $startDate = $dateRanges[0] ?? null; // Ensure valid index


        // Process start date based on range type
        if ($dateRangeType->value == ReportRangeGeneratorType::DAY->value) {
            $startDate = DateTime::createFromFormat('d.m.Y', $startDate);
        } elseif ($dateRangeType->value == ReportRangeGeneratorType::WEEK->value) {
            $startDate = $this->dateRangeService->getFirstDateOfWeek($startDate);
        } else {
            $startDate = $this->dateRangeService->getFirstDateOfMonth($startDate);
        }

        $startDate = $startDate instanceof DateTime ? $startDate->format('Y-m-d') : $startDate;

        // Fetch related data
        $crmActions = CrmAction::where('is_active', 1)
            ->orderBy('sort_order', 'asc')
            ->get();

        $marketSegments = MarketSegment::where('is_active', 1)
            ->orderBy('sort_order', 'asc')
            ->get();

        $responsibles = CustomerCrmActionLog::join('users', 'users.id', '=', 'customer_crm_action_logs.user_id')
            ->distinct()
            ->select('users.name as name', 'users.custom_id AS custom_id', 'users.id as id')
            ->get();

        $countries = CustomerCrmActionLog::join('customers', 'customer_crm_action_logs.customer_id', '=', 'customers.id')
            ->join('countries', 'customers.country_id', '=', 'countries.id')
            ->distinct()
            ->select('countries.name as name', 'countries.custom_id as custom_id', 'countries.id AS id')
            ->get();

        // Fetch master data
        $masterData = CustomerCrmActionLog::join('crm_actions', 'customer_crm_action_logs.crm_action_id', '=', 'crm_actions.id')
            ->join('users', 'customer_crm_action_logs.user_id', '=', 'users.id')
            ->join('customers', 'customer_crm_action_logs.customer_id', '=', 'customers.id')
            ->leftJoin('market_segments', 'customers.market_segment_id', '=', 'market_segments.id')
            ->join('countries', 'customers.country_id', '=', 'countries.id')
            ->select(
                'customers.name as customer',
                'customers.custom_id as customer_custom_id',
                'users.custom_id as user_custom_id',
                'crm_actions.custom_id as crm_action_custom_id',
                'customer_crm_action_logs.crm_action_id as id',
                $dateFunction,
                $monthFunction,
                $weekFunction,
                $weekYearFunction,
                $monthYearFunction,
                'crm_actions.name as action',
                'customer_crm_action_logs.note as Note',
                'users.name as user',
                'customers.name as customer_name',
                'countries.name as country_name',
                'countries.custom_id AS country_custom_id',
                'countries.id AS country_id',
                'market_segments.name as market_segment_name',
                'market_segments.custom_id as market_segment_custom_id'
            );

        $segmentArray = collect([
            $request->input('segments'),
            $request->input('segment_filter_list')
        ])
            ->filter() // Remove null/empty values
            ->flatMap(fn($segments) => explode(',', $segments)) // Flatten into a single array
            ->unique() // Remove duplicates
            ->all();

        if (!empty($segmentArray)) {
            $masterData->whereIn('market_segments.id', $segmentArray);
        }

        $actions  = $request->input('actions');

        if (!empty($actions)) {
            $actionsArray = explode(',', $actions);
            $masterData->whereIn('crm_actions.id', $actionsArray);
        }

        $users = $request->input('users');

        if (!empty($users)) {
            $usersArray = explode(',', $users);
            $masterData->whereIn('users.id', $usersArray);
        }

        $countriesFilter = $request->input('countries');

        if (!empty($countriesFilter)) {
            $countriesArray = explode(',', $countriesFilter);
            $masterData->whereIn('countries.id', $countriesArray);
        }

        $dateFilter = $request->input('date_filter_list');
        if (!empty($dateFilter)) {

            if ($dateRangeType->value == ReportRangeGeneratorType::DAY->value) {
                $dates = explode(',', $dateFilter);
                $formattedDates = array_map(function ($date) {
                    return Carbon::createFromFormat('d.m.Y', $date)->format('Y-m-d');
                }, $dates);
                $masterData->whereIn(DB::raw('DATE(customer_crm_action_logs.log_date)'), $formattedDates);
            } elseif ($dateRangeType->value == ReportRangeGeneratorType::WEEK->value) {
                $weekYearStrings  = explode(',', $dateFilter);

                $allDates = [];

                // Loop through each weekYearString and get all the dates for that week
                foreach ($weekYearStrings  as $key => $weekYearString) {
                    $weekDates = $this->getWeekDates($weekYearString);
                    $allDates = array_merge($allDates, $weekDates);
                }

                $allDates = array_unique($allDates);
                $masterData->whereIn(DB::raw('DATE(customer_crm_action_logs.log_date)'), $allDates);
            } else {
                $monthYearStrings = explode(',', $dateFilter);

                $allDates = [];

                foreach ($monthYearStrings as $key => $monthYearString) {
                    $monthDates = $this->getMonthDatesFromString($monthYearString);
                    $allDates = array_merge($allDates, $monthDates);
                }
                $allDates = array_unique($allDates);
                $masterData->whereIn(DB::raw('DATE(customer_crm_action_logs.log_date)'), $allDates);
            }
        } else {
            $masterData->whereBetween('customer_crm_action_logs.log_date', [$startDate, $endDate]);
        }


        $masterData = $masterData->get();

        // Return the response
        return response()->json([
            'masterData' => $masterData,
            'crmActions' => $crmActions,
            'responsible' => $responsibles,
            'countries' => $countries,
            'marketSegments' => $marketSegments,
            'dateRanges' => $dateRanges,
        ]);
    }

    public function getWeekDates($weekYearString)
    {
        [$weekNumber, $year] = explode('.', $weekYearString);

        $weekNumber = (int) $weekNumber;
        $year = (int) $year;

        // Get the start of the given ISO week (Monday as the first day of the week)
        $startOfWeek = Carbon::now()
            ->setISODate($year, $weekNumber, 1) // 1 means Monday
            ->startOfDay();

        // Initialize an array to hold the dates
        $dates = [];

        // Loop to get all 7 days of the week
        for ($i = 0; $i < 7; $i++) {
            $dates[] = $startOfWeek->copy()->addDays($i)->format('Y-m-d');
        }
        return $dates;
    }

    public function getMonthDatesFromString($monthYearString)
    {
        [$month, $year] = explode('.', $monthYearString);
        $month = (int) $month;
        $year = (int) $year;

        // Get the first day of the month
        $startOfMonth = Carbon::create($year, $month, 1)->startOfDay();

        // Get the last day of the month
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $dates = [];

        // Loop through all days of the month
        while ($startOfMonth->lte($endOfMonth)) {
            $dates[] = $startOfMonth->format('Y-m-d');
            $startOfMonth->addDay();
        }
        return $dates;
    }

    public function getDates(Request $request)
    {
        // Validate that 'table_name' and 'column_name' exist in the request
        if (!$request->has('table_name') || !$request->has('column_name')) {
            return response()->json([
                'error' => 'Missing required parameters: table_name or column_name.'
            ], 400);
        }

        // Get the input values
        $table_name = $request->input('table_name');
        $column_name = $request->input('column_name');

        // Dynamic query using table_name and column_name
        $uniqueDates = DB::table($table_name)
            ->selectRaw("DATE($column_name) as created_date")
            ->whereNotNull($column_name)
            ->distinct()
            ->orderByDesc('created_date')
            ->pluck('created_date');

        // Convert each date string to a Carbon instance and then format it
        $formattedDates = $uniqueDates->map(function ($date) {
            return \Carbon\Carbon::parse($date)->format('d-m-Y');
        });

        return response()->json($formattedDates);
    }
}
