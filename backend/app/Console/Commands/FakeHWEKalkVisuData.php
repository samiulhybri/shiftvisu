<?php

namespace App\Console\Commands;

use App\Models\Bom;
use App\Models\Calculation;
use App\Models\ChemAnalysis;
use App\Models\Crucible;
use App\Models\Customer;
use App\Models\Item;
use App\Models\Machine;
use App\Models\Material;
use App\Models\Norm;
use App\Models\NormChemAnalysis;
use App\Models\Offer;
use App\Models\OfferPos;
use App\Models\OperationPlan;
use App\Models\OperationPlanPos;
use App\Models\SalesOpportunity;
use App\Models\Specification;
use App\Models\User;
use Database\Seeders\HweKalkIdGeneratorSeeder;
use Illuminate\Console\Command;

class FakeHWEKalkVisuData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fake_hwe_kalk:seed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'executes fake data for Mouldplast tables';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        Customer::factory()->count(10)->create();
        Bom::factory()->count(20)->create();
        Machine::factory()->count(20)->create();
        OperationPlan::factory()
            ->has(
                OperationPlanPos::factory()
                    ->count(rand(2, 4), 'operationPlanPos'))
            ->count(20)
            ->create();
        Item::factory()->count(20)->create();
        ChemAnalysis::factory()->count(20)->create();
        Material::factory()->count(10)->create();
        Norm::factory()->count(50)->create();
        Specification::factory()->count(100)->create();
        SalesOpportunity::factory()
            ->has(Offer::factory()
                ->has(
                    OfferPos::factory()
                        ->has(
                            Calculation::factory()
                                ->count(1, 'calculation'))
                        ->count(rand(1, 3)), 'offerPos'))
            ->count(1, 'offer')
            ->count(100)
            ->create();
        NormChemAnalysis::factory()->count(400)->create();
        User::factory()->count(5)->create();
        Crucible::factory()->count(5)->create();

        # add seeder file for HWEKalk Id generate
        $this->call(HweKalkIdGeneratorSeeder::class);
    }
}
