<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Classification;
use App\Models\Customer;
use App\Models\SalesOrder;
use App\Models\DataImport;
use App\Models\SalesOrderPos;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class SalesOrderDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:salesorder';

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
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        $customers = collect();
        foreach (Customer::all() as $customer) {
            $customers[$customer->custom_id] = $customer->id;
        }

        $xmlIds = [];

        while ($chunk = $ds->salesOrderDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $salesOrderDto) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($salesOrderDto->xml_id) && !in_array($salesOrderDto->xml_id, $xmlIds)) {
                    $xmlIds[] = $salesOrderDto->xml_id;
                }

                $salesOrder = SalesOrder::where('custom_id', $salesOrderDto->custom_id)->first();
                if (!$salesOrder) {

                    if (!(isset($salesOrderDto->custom_id) && isset($salesOrderDto->customer_id_custom) && $customers->has($salesOrderDto->customer_id_custom))) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $salesOrder = new SalesOrder();
                    $salesOrder->custom_id = $salesOrderDto->custom_id;
                }
                $salesOrder->customer_id = $customers[$salesOrderDto->customer_id_custom];
                $salesOrder->customer_reference = $salesOrderDto->customer_reference;
                $salesOrder->save();

                foreach ($salesOrderDto->sales_order_pos as $salesOrderPosDto) {
                    $salesOrderPos = $salesOrder->salesOrderPos()->where("pos", $salesOrderPosDto->pos)->first();
                    if (!$salesOrderPos) {
                        $salesOrderPos = new SalesOrderPos();
                        $salesOrderPos->pos = $salesOrderPosDto->pos;
                    }
                    $salesOrderPos->quantity = $salesOrderPosDto->quantity;
                    $salesOrderPos->customer_reference = $salesOrderPosDto->customer_reference;
                    $salesOrderPos->customer_material_number = $salesOrderPosDto->customer_material_number;
                    $salesOrderPos->delivery_date = $salesOrderPosDto->delivery_date;
                    $salesOrderPos->name = $salesOrderPosDto->name;
                    $salesOrderPos->sales_order_id = $salesOrder->id;

                    $salesOrderPos->save();
                    foreach ($salesOrderPosDto->classifications as $classificationDto) {
                        Classification::updateOrCreate(
                            [
                                "model_type" => SalesOrderPos::class,
                                "model_id" => $salesOrderPos->id,
                                "class" => $classificationDto->class,
                                "attribute" => $classificationDto->attribute,
                            ],
                            [
                                "value_string" => $classificationDto->value_string,
                                "value_double" => $classificationDto->value_double,
                            ]
                        );
                    }
                }

                foreach ($salesOrderDto->classifications as $classificationDto) {
                    Classification::updateOrCreate(
                        [
                            "model_type" => SalesOrder::class,
                            "model_id" => $salesOrder->id,
                            "class" => $classificationDto->class,
                            "attribute" => $classificationDto->attribute,
                        ],
                        [
                            "value_string" => $classificationDto->value_string,
                            "value_double" => $classificationDto->value_double,
                        ]
                    );
                }
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        return 0;
    }
}
