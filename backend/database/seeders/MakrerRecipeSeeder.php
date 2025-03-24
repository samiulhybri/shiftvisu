<?php

namespace Database\Seeders;

use App\Models\IdGeneratorSetting;
use Haruncpi\LaravelIdGenerator\IdGenerator;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MakrerRecipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->idGenerator();
    }

    public function idGenerator() {
        IdGeneratorSetting::create(["entity" => "MarkerRecipes", "table" => "marker_recipes", "prefix" => "MR-", "field" => "custom_id", "length" => 8]);
    }
}
