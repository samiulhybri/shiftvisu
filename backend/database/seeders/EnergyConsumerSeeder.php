<?php

namespace Database\Seeders;

use App\Models\IdGeneratorSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EnergyConsumerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->consumerGroupIdGenerator();
    }

    public function consumerGroupIdGenerator() {
        IdGeneratorSetting::create(["entity" => "EnergyConsumerGroups", "table" => "energy_consumer_groups", "prefix" => "", "field" => "custom_id", "length" => 6]);
    }
}