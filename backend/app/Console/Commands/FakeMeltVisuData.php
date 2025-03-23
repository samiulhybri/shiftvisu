<?php

namespace App\Console\Commands;

use App\Models\Crucible;
use App\Models\Item;
use App\Models\Machine;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FakeMeltVisuData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fake_melt:seed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'executes fake data for Melt-visu tables';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {
            Item::create(['custom_id' => 'item6.3.2', 'name' => 'I1', 'is_sales_item' => 0, 'is_alloy' => 1, 'use_stock_for_backlog' => 3]);
            Item::create(['custom_id' => 'item123.6.3', 'name' => 'I2','is_sales_item' => 0, 'is_alloy' => 1, 'use_stock_for_backlog' => 2]);
            Item::create(['custom_id' => 'item749.4.2', 'name' => 'I3', 'is_sales_item' => 0, 'is_alloy' => 1, 'use_stock_for_backlog' => 7]);
            Item::create(['custom_id' => 'item126.3.2', 'name' => 'I4', 'is_sales_item' => 0, 'is_alloy' => 1, 'use_stock_for_backlog' => 4]);
            Item::create(['custom_id' => 'item974.6.2', 'name' => 'I5', 'is_sales_item' => 0, 'is_alloy' => 1, 'use_stock_for_backlog' => 8]);

            Crucible::create(['custom_id' => '23001', 'name' => 'C1', 'capacity' => 882]);
            Crucible::create(['custom_id' => '23002', 'name' => 'C2', 'capacity' => 233]);
            Crucible::create(['custom_id' => '23003', 'name' => 'C3', 'capacity' => 534]);
            Crucible::create(['custom_id' => '23004', 'name' => 'C4', 'capacity' => 422]);
            Crucible::create(['custom_id' => '23005', 'name' => 'C5', 'capacity' => 756]);
            Crucible::create(['custom_id' => '23006', 'name' => 'C6', 'capacity' => 243]);
            Crucible::create(['custom_id' => '23007', 'name' => 'C7', 'capacity' => 656]);
            Crucible::create(['custom_id' => '23008', 'name' => 'C8', 'capacity' => 212]);
            Crucible::create(['custom_id' => '23009', 'name' => 'C9', 'capacity' => 765]);
            Crucible::create(['custom_id' => '230010', 'name' => 'C10', 'capacity' => 864]);

            Machine::create(['custom_id' => 'mac003', 'name' => 'M1', 'usage_factor' => 1, 'tr' => 3, 'is_furnace' => 1, 'is_casting_machine' => 0]);
            Machine::create(['custom_id' => 'mac325', 'name' => 'M2', 'usage_factor' => 3, 'tr' => 8, 'is_furnace' => 1, 'is_casting_machine' => 0]);
            Machine::create(['custom_id' => 'mac993', 'name' => 'M3', 'usage_factor' => 8, 'tr' => 1, 'is_furnace' => 1, 'is_casting_machine' => 0]);
            Machine::create(['custom_id' => 'mac932', 'name' => 'M4', 'usage_factor' => 1,'tr' => 8, 'is_furnace' => 1, 'is_casting_machine' => 0]);
            Machine::create(['custom_id' => 'mac254', 'name' => 'M5','usage_factor' => 9,'tr' => 3, 'is_furnace' => 1, 'is_casting_machine' => 0]);
            Machine::create(['custom_id' => 'mac742', 'name' => 'M6', 'usage_factor' => 3,'tr' => 9, 'is_furnace' => 0, 'is_casting_machine' => 1]);
            Machine::create(['custom_id' => 'mac852', 'name' => 'M7', 'usage_factor' => 8,'tr' => 2, 'is_furnace' => 0, 'is_casting_machine' => 1]);
            Machine::create(['custom_id' => 'mac8596', 'name' => 'M8', 'usage_factor' => 5,'tr' => 5, 'is_furnace' => 0, 'is_casting_machine' => 1]);
            Machine::create(['custom_id' => 'mac424', 'name' => 'M9', 'usage_factor' => 7,'tr' => 5, 'is_furnace' => 0, 'is_casting_machine' => 1]);
            Machine::create(['custom_id' => 'mac854', 'name' => 'M10', 'usage_factor' => 2,'tr' => 9, 'is_furnace' => 0, 'is_casting_machine' => 1]);

            User::create([ 'name' => 'user1', 'email' => 'user1@example.com', 'password'=> 'sdser', 'custom_id' => '1000']);
            User::create([ 'name' => 'user2', 'email' => 'user2@example.com', 'password'=> 'ytrgf', 'custom_id' => '1001']);
            User::create([ 'name' => 'user3', 'email' => 'user3@example.com', 'password'=> 'freyg', 'custom_id' => '1002']);
            User::create([ 'name' => 'user4', 'email' => 'user4@example.com', 'password'=> 'ggfvg', 'custom_id' => '1003']);
            User::create([ 'name' => 'user5', 'email' => 'user5@example.com', 'password'=> 'dfgf', 'custom_id' => '1004']);

            Log::info("Melt Visu data seeding completed successfully!");
        } catch (\Throwable $th) {
            Log::error($th);
        }
        return 0;
    }
}
