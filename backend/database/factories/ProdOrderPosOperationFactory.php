<?php

namespace Database\Factories;

use App\Models\Machine;
use App\Models\MachineGroup;
use App\Models\ProdLot;
use App\Models\ProdOrderPos;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProdOrderPosOperation>
 */
class ProdOrderPosOperationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $startOfYear = now()->startOfYear();
        $endOfYear = now()->endOfYear();
        $randomDateThisYear = $this->faker->dateTimeBetween($startOfYear, $endOfYear)->format('Y-m-d');

        return [
            'prod_order_pos_id' => ProdOrderPos::inRandomOrder()->first()->id,
            'pos' => rand(10, 10000),
            'registered_quantity' => rand(10, 10000),
            'name' => fake()->word,
            'start' => $start = Carbon::now()->addDays(rand(0, 15)),
            'end' => $start->addDays(rand(2, 3)),
            'cavity' => rand(1, 2),
            'machine_id' => Machine::inRandomOrder()->first()->id,
            'prod_lot_id' => rand(0, 1) ? ProdLot::inRandomOrder()->first()->id : null,
            'machine_group_id' => MachineGroup::inRandomOrder()->first()?->id,
        ];
    }
}
