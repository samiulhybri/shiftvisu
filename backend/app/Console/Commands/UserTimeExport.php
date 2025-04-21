<?php

namespace App\Console\Commands;

use App\Enums\DataExportName;
use App\Models\DataExport;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UserTimeExport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user-time:export';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $data = DB::table('prod_orders')
            ->join('prod_order_pos', 'prod_orders.id', '=', 'prod_order_pos.prod_order_id')
            ->join('prod_order_pos_operations', 'prod_order_pos.id', '=', 'prod_order_pos_operations.prod_order_pos_id')
            ->join('user_registered_times', 'user_registered_times.prod_order_pos_operation_id', '=', 'prod_order_pos_operations.id')
            ->join('users', 'user_registered_times.user_id', '=', 'users.id')
            ->join('machines', 'user_registered_times.machine_id', '=', 'machines.id')
            ->leftJoin('machine_states', 'machine_states.id', '=', 'user_registered_times.machine_state_id')
            ->leftJoin('machine_state_groups', 'machine_states.machine_state_group_id', '=', 'machine_state_groups.id')
            ->where('user_registered_times.is_exported', false)
            ->groupBy('prod_orders.custom_id', 'prod_order_pos.pos', 'prod_order_pos_operations.pos', 'users.custom_id', 'users.is_imported_from_erp', 'machines.custom_id', 'machine_states.custom_id', 'machine_state_groups.custom_id', 'machine_state_groups.is_productive', 'user_registered_times.status_operation')
            ->select(
                'prod_orders.custom_id as prod_order_custom_id',
                'prod_order_pos.pos as pos',
                'prod_order_pos_operations.pos as operation_pos',
                'users.custom_id as user_custom_id',
                'users.is_imported_from_erp as user_is_imported_from_erp',
                'machines.custom_id as machine_custom_id',
                'machine_states.custom_id as machine_state',
                'machine_state_groups.custom_id as machine_state_group',
                'machine_state_groups.is_productive as machine_state_group_is_productive',
                'user_registered_times.status_operation as status',
                DB::raw('SUM(user_registered_times.hours_split) as time'),
                DB::raw('MAX(user_registered_times.id) as registered_time_id') // Select max(id) for export tracking
            )
            ->get();

        // Get the ID of the last processed user_registered_times
        $lastProcessedId = $data->max('registered_time_id') ?? null;

        // Transform data into structured JSON format
        $jsonData = $data->groupBy('prod_order_custom_id')->map(function ($orders) {
            return [
                'prod_order_custom_id' => $orders->first()->prod_order_custom_id,
                'posting_date' => now(),
                'pos' => $orders->groupBy('pos')->map(function ($positions) {
                    return [
                        'pos' => $positions->first()->pos,
                        'operations' => $positions->groupBy('operation_pos')->map(function ($operations) {
                            return [
                                'pos' => $operations->first()->operation_pos,
                                'times' => $operations->map(function ($time) {
                                    return [
                                        'user_custom_id' => $time->user_custom_id,
                                        'user_is_imported_from_erp' => $time->user_is_imported_from_erp,
                                        'machine_custom_id' => $time->machine_custom_id,
                                        'machine_state' => $time->machine_state,
                                        'machine_state_group' => $time->machine_state_group,
                                        'machine_state_group_is_productive' => $time->machine_state_group_is_productive,
                                        'status' => $time->status,
                                        'time' => (float) $time->time,
                                    ];
                                })->values(),
                            ];
                        })->values(),
                    ];
                })->values(),
            ];
        })->values();

        // Step 2: Mark all user_registered_times up to the last processed ID as exported
        if ($lastProcessedId) {
            DB::table('user_registered_times')
                ->where('id', '<=', $lastProcessedId)
                ->update(['is_exported' => true]);
        }

        $dataToInsert = [];
        foreach ($jsonData as $data) {
            $dataToInsert[] = [
                "name" => DataExportName::OPERATION_USER_TIMES(),
                "data" => json_encode($data),
                "created_at" => now(),
                "updated_at" => now(),
            ];
        }

        // Perform the bulk insert if data is available
        if (!empty($dataToInsert)) {
            DataExport::query()->insert($dataToInsert);
        }

    }
}
