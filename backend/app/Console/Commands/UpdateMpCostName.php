<?php

namespace App\Console\Commands;

use App\Enums\MPOffer\MPCostType;
use App\Models\MpCost;
use App\Models\MpOfferPos;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateMpCostName extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:mp_cost_name';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '"Campionatura preserie" cost update"';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        MpCost::where('name', 'Campionatura preserie')->update(['name' => 'Stampaggio (campionatura)', 'cost_type' => MPCostType::HOURS()]);
        MpOfferPos::where('name', 'Campionatura preserie')->update(['name' => 'Stampaggio (campionatura)', 'cost_type' => MPCostType::HOURS()]);

        Log::info('Mp Cost name & type updated successfully!');
    }
}
