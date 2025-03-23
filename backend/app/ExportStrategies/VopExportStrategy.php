<?php

namespace App\ExportStrategies;

use App\Enums\DataExportName;
use App\Contracts\ExportStrategy;
use App\Models\DataExport;
use App\Models\ProdOrder;
use App\Models\Machine;
use App\Models\Tool;
use App\Models\Item;
use Exception;
use Illuminate\Support\Str;
use App\Enums\ProdOrderType;
use App\Enums\ProdOrderPosOperationStatus;
use Carbon\Carbon;
use Storage;

//This is a file based export so no need to connect to any odbc/pdo(removed it) pls look in other exports to see export to database tables 
class VopExportStrategy extends ExportStrategy
{
    public function exportQuantityCount(DataExport $dataExport): ExportResult
    {
        //TODO: Export to txt file LAUF.DAT Not done yet
        $realdata = json_decode($dataExport->data);
        try {
            foreach ($realdata as $row) {
                $toReplace = "";
                //This is to strip off the DE- or BG- our Import is required to add
                if (Str::startsWith($row->prod_order_custom_id, 'DE-')) {
                    //German Order has to be produced in Germany So stripping machine etc too of DE-
                    $toReplace = "DE-";
                } else if (Str::startsWith($row->prod_order_custom_id, 'BG-')) {
                    //Bulgarian Order has to be produced in Bulgaria So stripping machine etc too of BG-
                    $toReplace = "BG-";
                } else {
                    return ExportResult::FAIL("NOT AN ORDER FROM THE IMPORT IN THE DATASET(DE- or/and BG- missing)" . json_encode($realdata));
                }
                $file = 'LAUF.dat';
                $exportPath = $this->getExportPath($file, $toReplace, "BDE");
                $fullExportPath = storage_path($exportPath);
                $fp = fopen($fullExportPath, 'a');
                $prodOrderCustomId = "";
                $workPlace = "";
                $RNr = "";
                $component = "";
                $goodpart = 0;
                $badpart = 0;
                $pointInTime = date("dmYHi");
                $machine = Machine::where('custom_id', $row->machine_custom_id)->first();

                $operation = ProdOrder::where('custom_id', $row->prod_order_custom_id)->first()
                    ->prodOrderPos()->where('pos', 10)->first()
                    ->prodOrderPosOperations()->where('machine_id', $machine->id)->where('pos', $row->prod_order_pos)->latest()->first();

                $RNr = $operation->operation_code_erp;
                //First Char decides if start(1) normal booking/add(2) or last booking/closing(3) is made
                $fileline = "2";
                if ($operation->status === ProdOrderPosOperationStatus::SUSPENDED()->value || $operation->status === ProdOrderPosOperationStatus::CLOSED()->value || $operation->status === ProdOrderPosOperationStatus::DELETED()->value) {
                    $fileline = "3";
                }
				//DE-2499090
                $prodOrderCustomId = str_replace($toReplace, "", $row->prod_order_custom_id);
                $workPlace = str_replace($toReplace, "", $row->machine_custom_id);
                if ($operation->tool_id !== null) {
                    $component = str_replace($toReplace, "", Tool::where('id', $operation->tool_id)->first()->custom_id);
                } else {
                    $ProdOrderPos = ProdOrder::where('custom_id', $row->prod_order_custom_id)->first()
                        ->prodOrderPos()->where('pos', 10)->first();
                    $component = str_replace($toReplace, "", Item::where('id', $ProdOrderPos->item_id)->first()->custom_id);
                }
                //Next is Order that is in the string from pos 2 to 20(Fill empty/missing space with " " so Space) writting str_pad explicitly as str_pad($row->prod_order_custom_id, 20) could have changed defaults at any new php version
                // This ($fileline .= str_pad()) things are commented out as file is now semicolon seperated
                // $fileline .= str_pad($prodOrderCustomId, 20, " ", STR_PAD_RIGHT);
                $fileline .= ";" . $prodOrderCustomId;
                //RNr is here needed(we need to Fetch the workstep/workplace RNr from the order)
                // $fileline .= str_pad($RNr, 8, " ", STR_PAD_RIGHT);
                $fileline .= ";" . $RNr;
                //Component(20 Chars)
                // $fileline .= str_pad($component, 20, " ", STR_PAD_RIGHT);
                $fileline .= ";" . $component;
                //Workplace(16 Chars)
                // $fileline .= str_pad($workPlace, 16, " ", STR_PAD_RIGHT);
                $fileline .= ";" . $workPlace;
                //Duration in industryminutes (8 Chars)
                $row->totalorder_prod_time_in__industriemin = floor(floatval($row->totalorder_prod_time_in_min) / 0.6);
                // $fileline .= str_pad($row->totalorder_prod_time_in__industriemin, 8, " ", STR_PAD_RIGHT);
                $fileline .= ";" . $row->totalorder_prod_time_in__industriemin;
                //NOW() (12 Chars DAYMONTHYEARHOURMINUTES(dmYHi 311220242359))
                // $fileline .= str_pad($pointInTime, 12, " ", STR_PAD_RIGHT);
                $fileline .= ";" . $pointInTime;
                //Goodparts (8 Chars)
                // $fileline .= str_pad($row->total_order_quantity_good_part, 8, " ", STR_PAD_RIGHT);
                $fileline .= ";" . $row->total_order_quantity_good_part;
                //Badparts (8 Chars + Dummy (18 Chars))
                // $fileline .= str_pad($row->total_order_quantity_bad_part_total, 26, " ", STR_PAD_RIGHT);
                $fileline .= ";" . $row->total_order_quantity_bad_part_total;
                //At the end of the one string line CRLF "\r\n" is needed to know that this is the end of the current Quantity record
                $fileline .= "\r\n";
                fwrite($fp, $fileline);
                fclose($fp);
            }
            return ExportResult::SUCCESS();
        } catch (Exception $e) {
            return ExportResult::FAIL($e->getMessage());
        }
    }

    public function exportProductionOrder(DataExport $dataExport): ExportResult
    {
        $realdata = json_decode($dataExport->data);
        try {
            foreach ($realdata->pos[0]->opPlanPos as $row) {
                if (!$row->is_enabled_plan_visu ?? false)
                    continue;

                $toReplace = "";
                $prodOrderCustomId = "";
                $workPlace = "";
                if (Str::startsWith($realdata->custom_id, 'DE-')) {
                    //German Order has to be produced in Germany So stripping machine etc too of DE-
                    $toReplace = "DE-";
                } else if (Str::startsWith($realdata->custom_id, 'BG-')) {
                    //Bulgarian Order has to be produced in Bulgaria So stripping machine etc too of BG-
                    $toReplace = "BG-";
                } else {
                    return ExportResult::FAIL("NOT AN ORDER FROM THE IMPORT IN THE DATASET(DE- or/and BG- missing)" . json_encode($realdata));
                }
                //This is to strip off the DE- or BG- our Import is required to add
                $prodOrderCustomId = str_replace($toReplace, "", $realdata->custom_id);
                $workPlace = str_replace($toReplace, "", $row->machine_custom_id);
                $file = 'PLAN.dat';
                $exportPath = $this->getExportPath($file, $toReplace, "PLAN");
                $fullExportPath = storage_path($exportPath);
                $fp = fopen($fullExportPath, 'a');
                //0=Moving the order, 1= Status is set to PLanned, 2= revert to status terminated, 3 =Delete, 4 = Proposed to Production order
                $fileline = "0";
                $pointInTime = date("dmYHi");
                $start = Carbon::parse($row->start, 'UTC')->setTimezone('Europe/Berlin')->format('dmYHi');
                $end = ($row->end != null) ? Carbon::parse($row->end, 'UTC')->setTimezone('Europe/Berlin')->format('dmYHi') : "";
                //Theoretically from pos 18 to 22 could contain info(butt is dummy thats why 20 is used instead of 16)
                // $fileline .= str_pad($prodOrderCustomId, 20, " ", STR_PAD_LEFT);
                $fileline .= ";" . $prodOrderCustomId;
                //$fileline .= str_pad($row->operation_code_erp, 8, " ", STR_PAD_LEFT);
                $fileline .= ";" . $row->operation_code_erp;
                //Operation code in case of machine has been changed
                $component = '';
                if ($row->operation_code_erp <> $row->operation_code) //Machine has been changed
                    $component = $row->operation_code; //Send new ID as operation code

                //$fileline .= str_pad($component, 36, " ", STR_PAD_LEFT);
                $fileline .= ";" . $component;
                // this line is currently empty
                $fileline .= ";";
                //$fileline .= str_pad($start, 12, " ", STR_PAD_LEFT);
                $fileline .= ";" . $start;
                //$fileline .= str_pad($end, 12, " ", STR_PAD_LEFT);
                $fileline .= ";" . $end;
                //$fileline .= str_pad($pointInTime, 12, " ", STR_PAD_LEFT);
                $fileline .= ";" . $pointInTime;
                //$fileline .= str_pad($row->cavity, 8, " ", STR_PAD_LEFT);
                $fileline .= ";" . $row->cavity;
                //$fileline .= str_pad(round(floatval($row->te), 3), 8, " ", STR_PAD_LEFT);
                $fileline .= ";" . round(floatval($row->te), 3);
                //$fileline .= str_pad($realdata->pos[0]->quantity, 12, " ", STR_PAD_LEFT);
                $fileline .= ";" . $realdata->pos[0]->quantity;
                //TODO: Replace with logic
                $anzAgg = null;
                $fileline .= ";" . ($anzAgg ?? 1);
                $fileline .= "\r\n";
                //TODO: ADD Toolchange Logic
                if ($row->tool_reference_nr != null  && $row->tool_reference_nr_erp != $row->tool_reference_nr) {
                    $fileline .= "0";
                    $fileline .= ";" . $prodOrderCustomId;
                    $fileline .= ";" . $row->tool_reference_nr_erp;
                    $fileline .= ";" . $row->tool_reference_nr;
                    // this line is currently empty
                    $fileline .= ";";
                    $fileline .= ";" . $start;
                    $fileline .= ";" . $end;
                    $fileline .= ";" . $pointInTime;
                    $fileline .= ";" . $row->cavity;
                    $fileline .= ";" . round(floatval($row->te), 3);
                    $fileline .= ";" . $realdata->pos[0]->quantity;
                    $fileline .= ";" . ($anzAgg ?? 1);
                    $fileline .= "\r\n";
                }
                // ADD status change Logic
                if ($row->status != $row->status_erp) {
                    $erpStatusCode = "0";
                    if ($row->status === ProdOrderPosOperationStatus::PLANNED()->value) {
                        $erpStatusCode = "1";
                    } else if ($row->status === ProdOrderPosOperationStatus::TERMINATED()->value) {
                        $erpStatusCode = "2";
                    } else if ($row->status === ProdOrderPosOperationStatus::CLOSED()->value) {
                        $erpStatusCode = "3";
                    }
                    $fileline .= $erpStatusCode;
                    if ($realdata->order_type === ProdOrderType::PROPOSED()->value) {
                        $fileline = "4";
                        //$fileline .= str_pad($prodOrderCustomId, 128, " ", STR_PAD_RIGHT);
                        $fileline .= ";" . $prodOrderCustomId . ";;;;;;;;;";
                        $fileline .= "\r\n";
                        fwrite($fp, $fileline);
                        fclose($fp);
                        //Exiting loop to set the order from proposed to Production(no other info needed then order custom_id)
                        return ExportResult::SUCCESS();
                    }
                    $fileline .= ";" . $prodOrderCustomId;
                    $fileline .= ";" . $row->operation_code_erp;
                    $component = '';
                    if ($row->operation_code_erp <> $row->operation_code)
                        $component = $row->operation_code;

                    $fileline .= ";" . $component;
                    // this line is currently empty
                    $fileline .= ";";
                    $fileline .= ";" . $start;
                    $fileline .= ";" . $end;
                    $fileline .= ";" . $pointInTime;
                    $fileline .= ";" . $row->cavity;
                    $fileline .= ";" . round(floatval($row->te), 3);
                    $fileline .= ";" . $realdata->pos[0]->quantity;
                    $fileline .= ";" . ($anzAgg ?? 1);
                    $fileline .= "\r\n";
                }
                fwrite($fp, $fileline);
                fclose($fp);
            }
            return ExportResult::SUCCESS();
        } catch (Exception $e) {
            return ExportResult::FAIL($e->getMessage());
        }
    }

    private function getExportPath(string $value, string $replacer = "", $place = ""): string
    {
        $pathToExport = $value;
        if (env('EXPORT_DIRECTORY') !== null && env('EXPORT_DIRECTORY') !== "") {
            $pathToExport = env('EXPORT_DIRECTORY');
            if (!str_ends_with($pathToExport, '/')) {
                $pathToExport .= '/';
            }
            if ($replacer === "DE-" || $replacer === "BG-") {
                $replacer = strtolower(Str::before($replacer, "-"));
                if ($place === "BDE") {
                    $pathToExport .= $replacer . "lauf/";
                } elseif ($place === "PLAN") {
                    $pathToExport .= $replacer . "plan/";
                }
            }
            $pathToExport .= $value;
        }
        return $pathToExport;
    }
}