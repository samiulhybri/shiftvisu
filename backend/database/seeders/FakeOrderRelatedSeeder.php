<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Machine;
use App\Models\ProdLot;
use App\Models\ProdOrder;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosOperation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FakeOrderRelatedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Item::factory()->count(30)->create();
        Machine::factory()->count(10)->create();
        ProdOrder::factory()->count(100)->create();
        ProdOrderPos::factory()->count(200)->create();
        ProdLot::factory()->count(50)->create();
        ProdOrderPosOperation::factory()->count(500)->create();
    }
}
