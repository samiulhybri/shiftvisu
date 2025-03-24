<?php

namespace Database\Seeders;

use App\Models\MpOffer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MPSaveDataUpdate extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->updatePreviousOffers();
    }

    public function updatePreviousOffers() {
        MpOffer::query()->update(['is_saved' => 1]);
    }
}
