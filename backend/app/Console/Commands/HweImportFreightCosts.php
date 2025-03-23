<?php

namespace App\Console\Commands;

use App\Models\Country;
use App\Models\HweFreightCost;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Spatie\SimpleExcel\SimpleExcelReader;

class HweImportFreightCosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hwe:import_freight_costs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $country = Country::where('custom_id', 'DE')->first();

        SimpleExcelReader::create('resources/sample/HWE_Freight.xlsx')
            ->fromSheetName('DE')->getRows()->each(function ($row) use ($country){
                $row = collect($row);
                $postalCodes = Str::of($row['PostalCode'])->explode(" - ");
                $postal_code_from = $postalCodes[0];
                $postal_code_to = $postalCodes[1];


                foreach ($row->except(['PostalCode'])->keys() as $weight_key) {
                    $weightCodes = Str::of($weight_key)->explode(" - ");
                    $delivery_weight_from = $weightCodes[0];
                    $delivery_weight_to = $weightCodes[1];

                    HweFreightCost::updateOrCreate([
                        'country_id' => $country->id,
                        'postal_code_from' => $postal_code_from,
                        'postal_code_to' => $postal_code_to,
                        'delivery_weight_from' => $delivery_weight_from,
                        'delivery_weight_to' => $delivery_weight_to,
                        'price' => $row[$weight_key],
                    ]);
                }
            });

        return Command::SUCCESS;
    }
}
