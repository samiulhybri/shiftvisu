<?php

namespace App\Console\Commands;

use App\Models\MachineProdOrderPosOperationTime;
use App\Models\MachineUserTime;
use App\Models\ProdOrderPosOperation;
use App\Models\Qualification;
use App\Models\QualificationUser;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class QualificationsUpdate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qualifications:update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update total_operations and total_hours for all qualifications and users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $records = DB::table('users')
            ->crossJoin('qualifications')
            ->leftJoin("qualification_users",
                function ($query) {
                    $query->on("qualifications.id", "=", "qualification_users.qualification_id")
                        ->on("users.id", "=", "qualification_users.user_id");
                })
            ->leftJoin(
                "user_registered_times",
                function ($query) {
                    $query
                        ->on("users.id", "=", "user_registered_times.user_id")
                        ->on(function ($query) {
                            $query
                                ->on("qualifications.machine_id", "=", "user_registered_times.machine_id")
                                ->orWhereNull("qualifications.machine_id");
                        })
                        ->whereExists(
                            function ($query) {
                                $query
                                    ->select(DB::raw(1))
                                    ->from("prod_order_pos_operations as operations")
                                    ->whereColumn("operations.id", "user_registered_times.prod_order_pos_operation_id")
                                    ->where(function ($query) {
                                        $query->whereColumn("operations.operation_code", "qualifications.operation_code")
                                            ->orWhereNull("qualifications.operation_code");
                                    })
                                    ->whereExists(
                                        function ($query) {
                                            $query
                                                ->select(DB::raw(1))
                                                ->from("prod_order_pos as pos")
                                                ->whereColumn("operations.prod_order_pos_id", "pos.id")
                                                ->where(function ($query) {
                                                    $query
                                                        ->whereColumn("qualifications.item_id", "pos.item_id")
                                                        ->orWhereNull("qualifications.item_id");
                                                });
                                        }
                                    );
                            }
                        );
                }
            )
            ->groupBy(["qualifications.id", "users.id", "qualification_users.id"])
            ->select([
                "qualifications.id as qualification_id",
                "users.id as user_id",
                DB::raw("SUM(COALESCE(user_registered_times.hours_split, 0)) as total_hours"),
                DB::raw("COUNT(DISTINCT user_registered_times.prod_order_pos_operation_id) as total_operations")
            ])
            ->having(DB::raw("SUM(COALESCE(user_registered_times.hours_split, 0))"), ">", 0)
            ->orHaving(DB::raw("COUNT(DISTINCT user_registered_times.prod_order_pos_operation_id)"), ">", 0)
            ->get();

        $insertionData = [];

        foreach ($records as $record) {
            $insertionData[] = [
                "qualification_id" => $record->qualification_id,
                "user_id" => $record->user_id,
                "total_hours" => $record->total_hours,
                "total_operations" => $record->total_operations
            ];
        }

        foreach (collect($insertionData)->chunk(env("DATA_CHUNK_SIZE")) as $chunk) {
            QualificationUser::query()->upsert($chunk->toArray(), ["qualification_id", "user_id"], ["total_hours", "total_operations"]);
        }
    }
}
