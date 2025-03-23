<?php

namespace App\Console\Commands\Export;

use App\Enums\DataExportName;
use App\Models\Calculation;
use App\Models\HweOfferPosWorkPlanLeadTime;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\DataExport;
use Illuminate\Support\Facades\Lang;

class OperationPlanExport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'operation_plan:export {calculation_id} {param2}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'export operation plan';

    /**
     * @return bool
     */

    public function handle(): bool
    {
        //This is a passed parameter from frontend with it we have to query the operation_plan_id + prod_orders.custom_id,
        // select prod_orders.custom_id, calculations.operation_plan_id from prod_orders join prod_order_pos on prod_order_pos.prod_order_id = prod_orders.id join calculations on calculations.id = prod_order_pos.calculation_id where calculations.id = $calculation_id;
        try {
            $calculation_id = $this->argument('calculation_id');
            $this->exportZppdata($calculation_id);
            $calculation = Calculation::find($calculation_id);
            foreach ($calculation->prodOrderPos as $prodOrderPos) {
                $result = array();
                $result['operation_plan_id'] = $calculation->operation_plan_id;
                $result['custom_id'] = $prodOrderPos->prodOrder->custom_id;

                $result['operations'] = array();
                foreach ($calculation->operationPlan->operationPlanPos as $operationPlanPos) {
                    $operation = array();
                    $operation['pos'] = $operationPlanPos->pos ?? '';
                    $operation['name'] = $operationPlanPos->name && Lang::has('messages.offerPosWorkPlanNameEnum.' . $operationPlanPos->name, 'de') ? trans('messages.offerPosWorkPlanNameEnum.' . $operationPlanPos->name, [], 'de'): '';
                    $operation['machine_custom_id'] = $operationPlanPos->machine->custom_id ?? null;
                    $operation['te'] = $operationPlanPos->te ?? 0;
                    $operation['tr'] = $operationPlanPos->tr ?? 0;
                    $operation['machine_cost_type'] = $operationPlanPos->machine->costCenter->costCenterCostToday->cost_type ?? null;
                    $operation['lead_time_days'] = HweOfferPosWorkPlanLeadTime::query()
                        ->where("name", $operationPlanPos->name)
                        ->where(function ($query) use ($operationPlanPos) {
                            $query
                                ->where('machine_id', $operationPlanPos->machine_id)
                                ->orWhereNull('machine_id');
                        })
                        ->orderBy(DB::raw('machine_id IS NULL'), 'ASC')
                        ->first()->lead_time_days ?? 0;
                    $result['operations'][] = $operation;
                }

                $DataExport = new DataExport();
                $DataExport->data = json_encode($result);
                $DataExport->name = DataExportName::OPERATION_PLAN();
                $DataExport->save();
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function exportZppdata($calc_id): bool
    {
        $result_db = DB::table('calculations')
            ->select('calculations.sales_order', 'calculations.sales_order_pos', 'calculations.delivery_weight', 'calculations.offer_pos_id', 'offer_pos.product_type', 'offer_pos.quantity', 'offer_pos.material_id', 'materials.warehouse_material', 'materials.name', 'offer_pos.item_id', 'items.custom_id', 'offer_pos_raw_dimensions.semi_finished_product', 'offer_pos_raw_dimensions.semi_finished_product_type', 'offer_pos_raw_dimensions.quantity_final_for_raw', 'offer_pos_raw_dimensions.operating_weight', 'calculations.text_raw_dimension')
            ->join('offer_pos', 'offer_pos.id', '=', 'calculations.offer_pos_id')
            ->join('materials', 'materials.id', '=', 'offer_pos.material_id')
            ->leftJoin('items', 'items.id', '=', 'offer_pos.item_id')
            ->join('offer_pos_raw_dimensions', 'offer_pos_raw_dimensions.offer_pos_id', '=', 'offer_pos.id')
            ->where('calculations.id', $calc_id)
            ->whereNotNull('calculations.sales_order_pos')
            ->whereNotNull('calculations.sales_order')
            ->get();
        if (count($result_db) > 0) {
            $result = array("raw_dimensions_semi_finished_product1" => 0, "raw_dimensions_semi_finished_product_type1" => 0, "raw_dimensions_quantity_raw_piece1" => 0, "raw_dimensions_operating_weight1" => 0, "raw_dimensions_quantity_raw_piece2" => 0, "raw_dimensions_operating_weight2" => 0, "raw_dimensions_quantity_raw_piece3" => 0, "raw_dimensions_operating_weight3" => 0);
            for ($i = 0; $i < count($result_db); $i++) {
                if ($i === 0) {
                    $result['calculation_sales_order'] = $result_db[$i]->sales_order;
                    $result['calculation_sales_order_pos'] = $result_db[$i]->sales_order_pos;
                    $result['material_warehouse_material'] = $result_db[$i]->warehouse_material;
                    $result['material_name'] = $result_db[$i]->name;
                    $result['offer_pos_product_type'] = $result_db[$i]->product_type;
                    $result['item_custom_id'] = $result_db[$i]->custom_id;
                    $result['raw_dimensions_semi_finished_product1'] = $result_db[$i]->semi_finished_product;
                    $result['raw_dimensions_semi_finished_product_type1'] = $result_db[$i]->semi_finished_product_type;
                    $result['calculation_delivery_weight'] = $result_db[$i]->delivery_weight;
                    $result['dimensions'] = $result_db[$i]->text_raw_dimension;
                    $result['offer_pos_quantity'] = $result_db[$i]->quantity;
                }
                $result['raw_dimensions_quantity_raw_piece' . ($i + 1)] = $result_db[$i]->quantity_final_for_raw;
                $result['raw_dimensions_operating_weight' . ($i + 1)] = $result_db[$i]->operating_weight;
            }
            $DataExport = new DataExport();
            $DataExport->data = json_encode($result);
            $DataExport->name = 'ZPP';
            $DataExport->save();
        }
        return true;
    }
}