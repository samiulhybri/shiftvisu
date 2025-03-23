<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Capacity;
use App\Models\User;
use Illuminate\Console\Command;

class OffDayDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:off_day';

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
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        $users = User::all()->pluck('id', 'custom_id');

        while ($chunk = $ds->offDayDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $dto) {
                if (!isset($users[$dto->user_id_custom])) {
                    continue;
                }

                $userId = $users[$dto->user_id_custom];

                Capacity::query()
                    ->where("capacitable_type", User::class)
                    ->where("capacitable_id", $userId)
                    ->where("date", $dto->date)
                    ->delete();
            }
        }
    }
}
