<?php

namespace Database\Factories;

use App\Enums\ProdOrderPosOperationStatus;
use App\Models\Item;
use App\Models\ProdOrder;
use App\Models\ProdOrderPosOperation;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProdOrderPos>
 */
class ProdOrderPosFactory extends Factory
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
            'prod_order_id' => ProdOrder::inrandomOrder()->first()->id,
            'pos' => rand(10, 1000),
            'item_id' => Item::inrandomOrder()->first()->id,
            'start' => $start = Carbon::now()->addDays(rand(0, 15)),
            'end' => $start->addDays(rand(2, 3)),
            'quantity' => rand(10, 100),
            'status' => array_rand(ProdOrderPosOperationStatus::toArray()),
            'due_date' => $randomDateThisYear,
        ];
    }
}
