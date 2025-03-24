<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Customer;
use Carbon\Carbon;

class CrmKanbanCurrentDate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crm:kanban-current-date';

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
        $customers = Customer::where('is_active', true)
            ->where(function ($query) {
                $query->where('date_follow_up', '<', Carbon::today());
            })
            ->update(['date_follow_up' => Carbon::today()]);
    }
}
