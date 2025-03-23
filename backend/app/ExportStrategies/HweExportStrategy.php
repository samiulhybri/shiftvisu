<?php

namespace App\ExportStrategies;

use App\Enums\CostType;
use App\Contracts\ExportStrategy;
use App\Models\DataExport;
use App\Models\Machine;
use Illuminate\Support\Facades\Http;

class HweExportStrategy extends ExportStrategy
{
    public function exportQuantityCount(DataExport $dataExport): ExportResult
    {
        if ($retryResult = $this->retry($dataExport)) {
            return $retryResult;
        }

        $tranformedjson = json_decode($dataExport->data);
        $xmlhead = new \SimpleXMLElement('<PPCC2PRETTICKET02/>');
        $date = date('Ymd');
        $time = date('Hms');
        $xml = $xmlhead->addChild('IDOC');
        $xml->addAttribute('begin', '1');
        $edi = $xml->addChild('EDI_DC40');
        $edi->addChild('TABNAM', 'EDI_DC40');
        $edi->addChild('MANDT', env('SAP_MANDANT'));
        $edi->addChild('DOCNUM', $dataExport->id);
        $edi->addChild('IDOCTYP', 'PPCC2PRETTICKET02');
        $edi->addChild('MESTYP', 'PPCC2PRETTICKET');
        $edi->addChild('SNDPOR', 'SAPDEV');
        $edi->addChild('SNDPRT', 'LS');
        $edi->addChild('SNDPRN', 'MESHWE_T');
        $edi->addChild('RCVPRT', 'LS');
        $edi->addChild('RCVPRN', 'EHW362');
        $edi->addChild('CREDAT', $date);
        $edi->addChild('CRETIM', $time);

        foreach ($tranformedjson as $datadb) {
            $xmlmain = $xml->addChild('E1BP_PP_TIMETICKET');
            $xmlmain->addAttribute('segment', "1");
            $xmlmain->addChild('ORDERID', str_pad($datadb->prod_order_custom_id, 12, "0", STR_PAD_LEFT));
            $xmlmain->addChild('OPERATION', sprintf('%04d', $datadb->prod_order_pos));
            $xmlmain->addChild('WORK_CNTR', $datadb->machine_custom_id);
            $xmlmain->addChild('WORK_CENTER', $datadb->machine_custom_id);
            $xmlmain->addChild('CONF_QUAN_UNIT', 'ST');
            $xmlmain->addChild('YIELD', number_format($datadb->quantity_good_part, 3, '.', ''));
            $xmlmain->addChild('SCRAP', number_format($datadb->quantity_bad_part_total, 3, '.', ''));
            $xmlmain->addChild('EX_IDENT', $datadb->uuid);
        }
        $formattedXml = $xmlhead->asXML();
        $formattedXml = str_replace('<?xml version="1.0"?>', '<?xml version="1.0" encoding="UTF-8"?>', $formattedXml);
        return $this->sendXmlToSap($formattedXml);
    }

    public function exportMachineTimes(DataExport $dataExport): ExportResult
    {
        if ($retryResult = $this->retry($dataExport)) {
            return $retryResult;
        }

        $tranformedjson = json_decode($dataExport->data);
        $xmlhead = new \SimpleXMLElement('<PPCC2PRETTICKET02/>');
        $date = date('Ymd');
        $time = date('Hms');
        $xml = $xmlhead->addChild('IDOC');
        $xml->addAttribute('begin', '1');
        $edi = $xml->addChild('EDI_DC40');
        $edi->addChild('TABNAM', 'EDI_DC40');
        $edi->addChild('MANDT', env('SAP_MANDANT'));
        $edi->addChild('DOCNUM', $dataExport->id);
        $edi->addChild('IDOCTYP', 'PPCC2PRETTICKET02');
        $edi->addChild('MESTYP', 'PPCC2PRETTICKET');
        $edi->addChild('SNDPOR', 'SAPDEV');
        $edi->addChild('SNDPRT', 'LS');
        $edi->addChild('SNDPRN', 'MESHWE_T');
        $edi->addChild('RCVPRT', 'LS');
        $edi->addChild('RCVPRN', 'EHW362');
        $edi->addChild('CREDAT', $date);
        $edi->addChild('CRETIM', $time);

        foreach ($tranformedjson as $dataMachineTime) {
            if ($dataMachineTime->machine_state_custom_id == env('PRODUCTION_V10') && $dataMachineTime->prod_order_custom_id !== "0" && $dataMachineTime->prod_order_custom_id !== null) {
                $costType = Machine::where('custom_id', $dataMachineTime->machine_custom_id)->first()->costCenter->costCenterCostToday->cost_type ?? null;
                $stdVal01 = 0.0;
                $stdVal02 = 0.0;
                $stdVal03 = 0.0;
                $valueUnit = '';
                //Changed where value writes into as Michael Stertenbrink said to write it in CONF_ACTIVITY1
                switch ($costType) {
                    case CostType::TIME():
                        $stdVal01 = $dataMachineTime->machinetime * 60;
                        $valueUnit = 'MIN';
                        break;
                    case CostType::QUANTITY():
                        $stdVal01 = $dataMachineTime->machinetime * 60;
                        $valueUnit = 'MIN';
                        break;
                    case CostType::WEIGHT():
                        $stdVal01 = $dataMachineTime->machinetime * 60;
                        $valueUnit = 'MIN';
                        break;
                }
                $xmlmain = $xml->addChild('E1BP_PP_TIMETICKET');
                $xmlmain->addAttribute('segment', "1");
                $xmlmain->addChild('ORDERID', str_pad($dataMachineTime->prod_order_custom_id, 12, "0", STR_PAD_LEFT));
                $xmlmain->addChild('OPERATION', sprintf('%04d', $dataMachineTime->prod_order_pos));
                $xmlmain->addChild('WORK_CNTR', $dataMachineTime->machine_custom_id);
                $xmlmain->addChild('CONF_ACTI_UNIT', $valueUnit);
                $xmlmain->addChild('CONF_ACTIVITY1', number_format($stdVal01, 3, '.', ''));
                $xmlmain->addChild('CONF_ACTIVITY2', number_format($stdVal02, 3, '.', ''));
                $xmlmain->addChild('CONF_ACTIVITY3', number_format($stdVal03, 3, '.', ''));
                $xmlmain->addChild('EX_IDENT', $dataMachineTime->uuid);
            }
        }
        $formattedXml = $xmlhead->asXML();
        $formattedXml = str_replace('<?xml version="1.0"?>', '<?xml version="1.0" encoding="UTF-8"?>', $formattedXml);
        return $this->sendXmlToSap($formattedXml);
    }

    public function exportOperationPlan(DataExport $dataExport): ExportResult
    {
        if ($retryResult = $this->retry($dataExport)) {
            return $retryResult;
        }

        $tranformedjson = json_decode($dataExport->data);
        $date = date('Ymd');
        $time = date('Hms');
        $xmlhead = new \SimpleXMLElement('<ZWORKORDER_CHG/>');
        $xml = $xmlhead->addChild('IDOC');
        $xml->addAttribute('begin', '1');
        $edi = $xml->addChild('EDI_DC40');
        $edi->addChild('TABNAM', 'EDI_DC40');
        $edi->addChild('MANDT', env('SAP_MANDANT'));
        $edi->addChild('DOCNUM', '' . $dataExport->id);
        $edi->addChild('IDOCTYP', 'ZWORKORDER_CHG');
        $edi->addChild('MESTYP', 'ZWORKORDER_CHG');
        $edi->addChild('SNDPOR', 'SAPDEV');
        $edi->addChild('SNDPRT', 'LS');
        $edi->addChild('SNDPRN', 'MESHWE_T');
        $edi->addChild('RCVPRT', 'LS');
        $edi->addChild('RCVPRN', 'EHW362');
        $edi->addChild('CREDAT', $date);
        $edi->addChild('CRETIM', $time);

        $xmlmain = $xml->addChild('Z1MESORDER');
        $xmlmain->addAttribute('segment', '1');
        $xmlmain->addChild('AUFNR', sprintf('%012d', $tranformedjson->custom_id));
        foreach ($tranformedjson->operations as $operationPlanPos) {
            if ($operationPlanPos->pos !== '60' && $operationPlanPos->pos !== '70' ) {
                $costType = $operationPlanPos->machine_cost_type ?? null;
                $stdVal01 = 0;
                $stdVal02 = 0;
                $stdVal03 = 0;
                $valueUnit = '';

                switch ($costType) {
                    case CostType::TIME():
                        $stdVal01 = $operationPlanPos->te;
                        $valueUnit = 'MIN';
                        break;
                    case CostType::QUANTITY():
                        $stdVal02 = $operationPlanPos->te;
                        $valueUnit = 'H';
                        break;
                    case CostType::WEIGHT():
                        $stdVal03 = $operationPlanPos->te;
                        $valueUnit = 'KG';
                        break;
                }

                $subrecord = $xmlmain->addChild('Z1MESOPERATION');
                $subrecord->addAttribute('segment', '1');
                $subrecord->addChild('OPERATION_NUMBER', sprintf('%04d', $operationPlanPos->pos));
                $subrecord->addChild('DESCRIPTION', $operationPlanPos->name);
                $subrecord->addChild('WORK_CENTER', $operationPlanPos->machine_custom_id);
                $subrecord->addChild('OPR_CNTRL_KEY', '');//Leaving it empty so SAP decides the key(tested with Stertenbrink)
                $subrecord->addChild('STANDARD_VALUE_01', number_format((int)$stdVal01, 3, '.', ''));
                $subrecord->addChild('STANDARD_VALUE_02', number_format((int)$stdVal02, 3, '.', ''));
                $subrecord->addChild('STANDARD_VALUE_03', number_format((int)$stdVal03, 3, '.', ''));
                $subrecord->addChild('STANDARD_VALUE_UNIT', $valueUnit);
                $subrecord->addChild('ZWNOR', number_format((int)$operationPlanPos->lead_time_days, 3, '.', ''));
                $subrecord->addChild('ZEIWN', 'T');
            }
        }

        $formattedXml = $xmlhead->asXML();
        $formattedXml = str_replace('<?xml version="1.0"?>', '<?xml version="1.0" encoding="UTF-8"?>', $formattedXml);

        return $this->sendXmlToSap($formattedXml);
    }

    public function exportZpp(DataExport $dataExport): ExportResult
    {
        if ($retryResult = $this->retry($dataExport)) {
            return $retryResult;
        }

        $datadb = json_decode($dataExport->data);
        $xmlhead = new \SimpleXMLElement('<ZPPTREE_DATA/>');
        $date = date('Ymd');
        $time = date('Hms');
        $xml = $xmlhead->addChild('IDOC');
        $xml->addAttribute('begin', '1');
        $edi = $xml->addChild('EDI_DC40');
        $edi->addChild('TABNAM', 'EDI_DC40');
        $edi->addChild('MANDT', env('SAP_MANDANT'));
        $edi->addChild('DOCNUM', $dataExport->id);
        $edi->addChild('IDOCTYP', 'ZPPTREE_DATA');
        $edi->addChild('MESTYP', 'ZPPTREE_DATA');
        $edi->addChild('SNDPOR', 'SAPDEV');
        $edi->addChild('SNDPRT', 'LS');
        $edi->addChild('SNDPRN', 'MESHWE_T');
        $edi->addChild('RCVPRT', 'LS');
        $edi->addChild('RCVPRN', 'EHW362');
        $edi->addChild('CREDAT', $date);
        $edi->addChild('CRETIM', $time);

        $xmlmain = $xml->addChild('Z1TREE_DATA');
        $xmlmain->addAttribute('segment', "1");
        $xmlmain->addChild('KDAUF', $datadb->calculation_sales_order);
        $xmlmain->addChild('KDPOS', $datadb->calculation_sales_order_pos);
        $xmlmain->addChild('WERKSTOFF_NR', $datadb->material_warehouse_material);
        $xmlmain->addChild('WERKSTOFF_NAME', $datadb->material_name);
        $xmlmain->addChild('PRODUKTTYP', $datadb->offer_pos_product_type);
        $xmlmain->addChild('MATNR', $datadb->item_custom_id);
        $xmlmain->addChild('QUERSCHNITT_HBZ', $datadb->raw_dimensions_semi_finished_product1);
        $xmlmain->addChild('QUERSCHNITT_HBZ_EH', $datadb->raw_dimensions_semi_finished_product_type1);
        $xmlmain->addChild('STUECKZAHL_PROD_1', $datadb->raw_dimensions_quantity_raw_piece1);
        $xmlmain->addChild('EINSATZGEWICHTE_1', $datadb->raw_dimensions_operating_weight1);
        $xmlmain->addChild('GEWEI_1', 'KG');
        $xmlmain->addChild('STUECKZAHL_PROD_2', $datadb->raw_dimensions_quantity_raw_piece2);
        $xmlmain->addChild('EINSATZGEWICHTE_2', $datadb->raw_dimensions_operating_weight2);
        $xmlmain->addChild('GEWEI_2', 'KG');
        $xmlmain->addChild('STUECKZAHL_PROD_3', $datadb->raw_dimensions_quantity_raw_piece3);
        $xmlmain->addChild('EINSATZGEWICHTE_3', $datadb->raw_dimensions_operating_weight3);
        $xmlmain->addChild('GEWEI_3', 'KG');
        $xmlmain->addChild('LIEFERGEWICHT', $datadb->calculation_delivery_weight);
        $xmlmain->addChild('GEWEI_LG', 'KG');
        //This is currently hard coded
        $xmlmain->addChild('ABMESSUNGEN', $datadb->dimensions);
        $xmlmain->addChild('ABMESSUNGEN_EH', 'MM');
        $xmlmain->addChild('KWMENG', $datadb->offer_pos_quantity);
        $xmlmain->addChild('VRKME', 'ST');
        $formattedXml = $xmlhead->asXML();
        $formattedXml = str_replace('<?xml version="1.0"?>', '<?xml version="1.0" encoding="UTF-8"?>', $formattedXml);
        return $this->sendXmlToSap($formattedXml);
    }

    public function exportQualiData(DataExport $dataExport): ExportResult
    {
        if ($retryResult = $this->retry($dataExport)) {
            return $retryResult;
        }

        $datadb = json_decode($dataExport->data);
        $xmlhead = new \SimpleXMLElement('<ZAUFK_CHG/>');
        $date = date('Ymd');
        $time = date('Hms');

        $xml = $xmlhead->addChild('IDOC');
        $xml->addAttribute('begin', '1');

        $edi = $xml->addChild('EDI_DC40');
        $edi->addChild('TABNAM', 'EDI_DC40');
        $edi->addChild('MANDT', env('SAP_MANDANT'));
        $edi->addChild('DOCNUM', $dataExport->id);
        $edi->addChild('IDOCTYP', 'ZAUFK_CHG');
        $edi->addChild('MESTYP', 'ZAUFK_CHG');
        $edi->addChild('SNDPOR', 'SAPDEV');
        $edi->addChild('SNDPRT', 'LS');
        $edi->addChild('SNDPRN', 'MESHWE_T');
        $edi->addChild('RCVPRT', 'LS');
        $edi->addChild('RCVPRN', 'EHW362');
        $edi->addChild('CREDAT', $date);
        $edi->addChild('CRETIM', $time);

        #will be removed later
        #structure 1
        /*foreach ($datadb as $orderId => $orderData) {
            if(!isset($orderData->packaging_details, $orderData->storage_location)) {
                continue;
            }

            // Add main Z1CI_AUFK node
            $xmlmain = $xml->addChild('Z1CI_AUFK');
            $xmlmain->addAttribute('segment', '1');
            $xmlmain->addChild('AUFNR', $orderId);

            // Process packaging details
            foreach ($orderData->packaging_details as $packagingDetail) {
                $xmlmain->addChild('ZZ_VERPART', $packagingDetail->status_name); // Packaging type
                $xmlmain->addChild('ZZ_ANZVERP', $packagingDetail->show_input_text); // Packaging quantity
            }

            foreach ($orderData->storage_location as $stamm) {
                if (!empty($stamm->inserted_status_name)) {
                    foreach ($stamm->inserted_status_name as $location) {
                        $xmlmain->addChild('ZZ_LGORT', $location->value); // Storage location
                    }
                }
            }
        }*/

        #structure 2
        // Iterate over each order
        foreach ($datadb as $orderId => $orderData) {
            if(!isset($orderData->packaging_details, $orderData->storage_location)) {
                continue;
            }

            // Extract all storage locations
            $storageLocations = [];
            foreach ($orderData->storage_location as $stamm) {
                if (!empty($stamm->inserted_status_name)) {
                    foreach ($stamm->inserted_status_name as $location) {
                        $storageLocations[] = $location->value ?? '';
                    }
                }
            }

            // Extract all packaging details
            foreach ($orderData->packaging_details as $packaging) {
                $packagingType = $packaging->status_name ?? '';
                $packagingQuantity = $packaging->show_input_text ?? '';

                // Create multiple <Z1CI_AUFK> nodes for each storage location
                foreach ($storageLocations as $storageLocation) {
                    $xmlmain = $xml->addChild('Z1CI_AUFK');
                    $xmlmain->addAttribute('segment', '1');
                    $xmlmain->addChild('AUFNR', $orderId);  // Order ID
                    $xmlmain->addChild('ZZ_VERPART', $packagingType);  // Packaging type
                    $xmlmain->addChild('ZZ_ANZVERP', $packagingQuantity);  // Packaging quantity
                    $xmlmain->addChild('ZZ_LGORT', $storageLocation);  // Storage location
                }
            }

        }

        #will be removed later
        #structure 3
        /*foreach ($datadb as $orderId => $orderData) {
            if(!isset($orderData->packaging_details, $orderData->storage_location)) {
                continue;
            }

            // Add main Z1CI_AUFK node
            $xmlmain = $xml->addChild('Z1CI_AUFK');
            $xmlmain->addAttribute('segment', '1');
            $xmlmain->addChild('AUFNR', $orderId);

            // Extract all storage locations
            $storageLocations = [];
            foreach ($orderData->storage_location as $stamm) {
                if (!empty($stamm->inserted_status_name)) {
                    foreach ($stamm->inserted_status_name as $location) {
                        $storageLocations[] = $location->value ?? '';
                    }
                }
            }

            // Process packaging details
            foreach ($orderData->packaging_details as $packagingDetail) {
                $packagingType = $packagingDetail->status_name ?? '';
                $packagingQuantity = $packagingDetail->show_input_text ?? '';

                foreach ($storageLocations as $storageLocation) {
                    $xmlmain->addChild('ZZ_VERPART', $packagingType);  // Packaging type
                    $xmlmain->addChild('ZZ_ANZVERP', $packagingQuantity);  // Packaging quantity
                    $xmlmain->addChild('ZZ_LGORT', $storageLocation);  // Storage location
                }
            }
        }*/

        $formattedXml = $xmlhead->asXML();
        $formattedXml = str_replace('<?xml version="1.0"?>', '<?xml version="1.0" encoding="UTF-8"?>', $formattedXml);

        return $this->sendXmlToSap($formattedXml);
    }

    private function retry(DataExport $dataExport): ?ExportResult
    {
        if ($dataExport->http_method && $dataExport->http_url) {
            $username = env('SAP_USERNAME');
            $password = env('SAP_PASSWORD');

            $response = Http::withBody($dataExport->http_payload, 'text/xml')
                ->withBasicAuth($username, $password)
                ->{$dataExport->http_method}($dataExport->http_url);

            return new ExportResult(
                $response->successful(),
                $response->body(),
                $dataExport->http_method,
                $dataExport->http_url,
                $dataExport->http_payload
            );
        } else {
            return null;
        }
    }

    private function sendXmlToSap($xml): ExportResult
    {
        $username = env('SAP_USERNAME');
        $password = env('SAP_PASSWORD');

        $response = Http::withBody($xml, 'text/xml')
            ->withBasicAuth($username, $password)
            ->post(env('SAP_EXPORT_LINK'), $xml);

        return new ExportResult(
            $response->successful(),
            $response->body(),
            'POST',
            env('SAP_EXPORT_LINK'),
            $xml
        );
    }
}
