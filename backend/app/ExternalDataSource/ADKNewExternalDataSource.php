<?php
namespace App\ExternalDataSource;

use DOMDocument;
use DOMXPath;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Carbon;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\UserType;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\ItemStateDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\MachineStateDto;
use App\ExternalDataSource\Dto\UserDto;
use Illuminate\Support\Facades\Log;
use SimpleXMLElement;

class ADKNewExternalDataSource extends BaseVisuExternalDataSource {

    public function __construct()
    {
        
    }

    private function loginServer() {

        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => env('CANIAS_ERP_API_URL'),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS =>'<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                                    <Body>
                                        <login xmlns="http://webservice.ias.com">
                                            <Client>00</Client>
                                            <Language>T</Language>
                                            <DBServer>CANIAS</DBServer>
                                            <DBName>'.env('CANIAS_ERP_DB_NAME').'</DBName>
                                            <ApplicationServer>'.env('CANIAS_ERP_APPLICATION_SERVER').'</ApplicationServer>
                                            <Username>'.env('CANIAS_ERP_USER_NAME').'</Username>
                                            <Password>'.env('CANIAS_ERP_PASSWORD').'</Password>
                                            <Encrypted>0</Encrypted>
                                            <Compression>0</Compression>
                                            <LCheck></LCheck>
                                            <VKey></VKey>
                                        </login>
                                    </Body>
                                </Envelope>',
            CURLOPT_HTTPHEADER => array(
                'SOAPAction: "#POST"',
                'Content-Type: application/xml'
            ),
        ));

        $response = curl_exec($curl);
        curl_close($curl);
        return $response;
    }

    public function logoutFromServer() {
        $sessionId = Cache::get('canias_session_id');
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => env('CANIAS_ERP_API_URL'),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS =>'<x:Envelope
                                    xmlns:x="http://schemas.xmlsoap.org/soap/envelope/"
                                    xmlns:web="http://webservice.ias.com">
                                    <x:Header/>
                                    <x:Body>
                                        <web:logout>
                                            <web:SessionId>'.$sessionId.'</web:SessionId>
                                        </web:logout>
                                    </x:Body>
                                </x:Envelope>',
            CURLOPT_HTTPHEADER => array(
                'SOAPAction: "#POST"',
                'Content-Type: application/xml'
            ),
        ));

        $response = curl_exec($curl);
        curl_close($curl);

        $xml = new SimpleXMLElement($response);
        $xml->registerXPathNamespace('soapenv', 'http://schemas.xmlsoap.org/soap/envelope/');
        $xml->registerXPathNamespace('ns1', 'http://webservice.ias.com');

        $logoutResponseNodes = $xml->xpath('//ns1:logoutResponse');
        if (empty($logoutResponseNodes)) {
            return false;
        }

        $jsonString = json_encode($logoutResponseNodes[0], JSON_PRETTY_PRINT);
        $result = json_decode($jsonString, true);
        $isLoggedOut = isset($result['logoutReturn']) ? $result['logoutReturn'] : false;
        if($isLoggedOut) {
            $currentTime = now()->toDateTimeString();
            Log::channel('adk_import')->info("
                logged out from canias api successfully | token: $sessionId | time: $currentTime
                ***************************************************************************************************
            ");
        }
        return $isLoggedOut;
    }

    public function setSessionId() {
        $xmlResponse = $this->loginServer();
        if($xmlResponse) {
            $xmlObject = simplexml_load_string($xmlResponse, "SimpleXMLElement", LIBXML_NOCDATA);
            $namespaces = $xmlObject->getNamespaces(true);
            $body = $xmlObject->children($namespaces['soapenv'])->Body;
            $multiRef = $body->children()->multiRef;
            $jsonString = json_encode($multiRef, JSON_PRETTY_PRINT);
            $result = json_decode($jsonString, true);
            if($result['Success'] == "true") {
                $sessionId = $result['SessionId'];
                $securityKey = $result['SecurityKey'];
                Cache::forget('canias_session_id');
                Cache::forget('canias_security_key');
                Cache::put('canias_session_id', $sessionId, now()->addMinutes(60));
                Cache::put('canias_security_key', $securityKey, now()->addMinutes(60));

                $currentTime = now()->toDateTimeString();
                Log::channel('adk_import')->info("
                ***************************************************************************************************
                    login to canias api successfully | token: $sessionId | time: $currentTime
                ");
                return true;
            }
        }
        return false;
    }

    public function machineDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('PRDListConfirmation');
        if($xmlResponse) {
            $arrayData = $this->parseSoapResponse($xmlResponse);
            if(count($arrayData)) {
                foreach ($arrayData as $result) {
                    $records->push(
                        new MachineDto(
                            custom_id: $result['CUSTOM_ID'],
                            name: isset($result['NAME']) && !is_array($result['NAME']) ? mb_convert_encoding($result['NAME'], 'UTF-8', 'UTF-8') : '',
                            is_active: $result['IS_ACTIVE']
                        )
                    );
                }
            }
        }
        return $records->toArray();
    }
    
    public function machineStateDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('PRDFailureList');
        if($xmlResponse) {
            $arrayData = $this->parseSoapResponse($xmlResponse);
            if(count($arrayData)) {
                foreach ($arrayData as $result) {
                    $customId = $result['COMPANY'] . '-' . $result['PLANT'] . '-' . $result['FAILURECODE'];
                    $records->push(
                        new MachineStateDto(
                            custom_id: $customId,
                            name: isset($result['STEXT']) && !is_array($result['STEXT']) ? mb_convert_encoding($result['STEXT'], 'UTF-8', 'UTF-8') : '',
                            is_active: true,
                            machine_state_group_id_custom: '00001'
                        )
                    );
                }
            }
        }
        return $records->toArray();
    }

    public function itemDtos($skip, $take): array|false
    {
        if ($skip) {
            return false;
        }

        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('GetMaterial');
        if($xmlResponse) {
            $arrayData = $this->parseSoapResponse($xmlResponse);
            if(count($arrayData)) {
                foreach ($arrayData as $result) {
                    $records->push(
                        new ItemDto(
                            custom_id: $result['CUSTOM_ID'],
                            name: isset($result['NAME']) && !is_array($result['NAME']) ? mb_convert_encoding($result['NAME'], 'UTF-8', 'UTF-8') : '',
                            is_active: $result['IS_ACTIVE'],
                        )
                    );
                }
            }
        }
        return $records->toArray();
    }

    public function itemStateDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('PRDWastageList');
        if($xmlResponse) {
            $arrayData = $this->parseSoapResponse($xmlResponse);
            if(count($arrayData)) {
                foreach ($arrayData as $result) {
                    $customId = $result['COMPANY'] . '-' . $result['PLANT'] . '-' . $result['SCRAPKEY'];
                    $records->push(
                        new ItemStateDto(
                            custom_id: $customId,
                            name: isset($result['STEXT']) && !is_array($result['STEXT']) ? mb_convert_encoding($result['STEXT'], 'UTF-8', 'UTF-8') : '',
                            is_active: true
                        )
                    );
                }
            }
        }
        return $records->toArray();
    }

    public function userDtos(int $skip, int $take): array|false
    {
        if ($skip) {
            return false;
        }

        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('GetContactNum');
        if($xmlResponse) {
            $results = $this->parseSoapResponse($xmlResponse);
            if(count($results)) {
                foreach ($results as $result) {
                    $records->push(
                        new UserDto(
                            custom_id: $result['CUSTOM_ID'],
                            name: mb_convert_encoding($result['NAME'], 'UTF-8', 'UTF-8'),
                            user_type: UserType::GUEST(),
                            password: "",
                            username: $result['CUSTOM_ID'],
                            is_active: (int)$result['IS_ACTIVE'],
                            chip_number: $result['CHIP_NUMBER'],
                        )
                    );
                }
            }
        }
        return $records->toArray();
    }

    public function halls(): Collection
    {
        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('PRDGetOrderInfo');
        if($xmlResponse) {
            $results = $this->parseSoapResponse($xmlResponse);
            foreach ($results as $result) {
                $records->push([
                    'custom_id' => $result['CUSTOM_ID'],
                    'name' => mb_convert_encoding($result['NAME'], 'UTF-8', 'UTF-8'),
                    'is_active' => (int)$result['IS_ACTIVE'],
                ]);
            }
        }
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function tools(): Collection
    {
        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('GetMaterial', 1);
        if($xmlResponse) {
            $results = $this->parseSoapResponse($xmlResponse);
            foreach ($results as $result) {
                $records->push([
                    'custom_id' => $result['CUSTOM_ID'],
                    'name' => mb_convert_encoding($result['NAME'], 'UTF-8', 'UTF-8'),
                    'is_active' => (int)$result['IS_ACTIVE'],
                ]);
            }
        }
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function customers(): Collection
    {
        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('GetCustomer');
        if($xmlResponse) {
            $results = $this->parseSoapResponse($xmlResponse);
            $mappedData = $this->getCustomerSupplierFilteredData($results);
            $customers = $mappedData['customers'];
            foreach ($customers as $customer) {
                $records->push([
                    'custom_id' => $customer['CUSTOM_ID'],
                    'name' => mb_convert_encoding($customer['NAME'], 'UTF-8', 'UTF-8'),
                    'is_active' => (int)$customer['IS_ACTIVE'],
                    'city' => isset($customer['CITY']) && $customer['CITY'] ? $customer['CITY'] : '',
                    'telephone' => isset($customer['TELNUM']) && $customer['TELNUM'] ? $customer['TELNUM'] : '',
                    'email' => isset($customer['TLXNUM']) && $customer['TLXNUM'] ? $customer['TLXNUM'] : ''
                ]);
            }
        }
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function suppliers(): Collection
    {
        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('GetCustomer');
        if($xmlResponse) {
            $results = $this->parseSoapResponse($xmlResponse);
            $mappedData = $this->getCustomerSupplierFilteredData($results);
            $suppliers = $mappedData['suppliers'];
            foreach ($suppliers as $supplier) {
                $records->push([
                    'custom_id' => $supplier['CUSTOM_ID'],
                    'name' => mb_convert_encoding($supplier['NAME'], 'UTF-8', 'UTF-8'),
                    'is_active' => (int)$supplier['IS_ACTIVE'],
                    'telephone' => isset($supplier['TELNUM']) && $supplier['TELNUM'] ? $supplier['TELNUM'] : '',
                    'email' => isset($supplier['TLXNUM']) && $supplier['TLXNUM'] ? $supplier['TLXNUM'] : ''
                ]);
            }
        }
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function prodOrders(?string $onlyCustomId): Collection
    {
        $records = collect();
        $xmlResponse = $this->callSoapApiByServiceName('PRDOrderList');
        if($xmlResponse) {
            $prod_orders = $this->parseSoapResponse($xmlResponse);

            $customOpPlanPos = collect([]);
            $opPlanPosName = collect([]);
            $opPlanPosStatus = collect([]);
            $opPlanPosTe = collect([]);
            $opPlanPosCavity = collect([]);
            $opPlanPosStart = collect([]);
            $opPlanPosEnd = collect([]);
            $opPlanPosCustomMachineId = collect([]);
            $opPlanPosCustomToolId = collect([]);


            $lastCustomId = '';
            $lastCustomPos = '';
            $lastCustomItemId = '';
            $lastQuantity = '';
            $lastStart = '';
            $lastEnd = '';

            foreach ($prod_orders as $prod_order) {
                if(strlen($lastCustomId) && $prod_order['CUSTOM_ID'] != $lastCustomId) {
                    $records->push([
                        'custom_id' => $lastCustomId,
                        'custom_pos' => $lastCustomPos,
                        'custom_item_id' => $lastCustomItemId,
                        'quantity' => $lastQuantity,
                        'start' => $lastStart,
                        'end' => $lastEnd,
                        'custom_op_plan_pos' => $customOpPlanPos,
                        'op_plan_pos_name' => $opPlanPosName,
                        'op_plan_pos_status' => $opPlanPosStatus,
                        'op_plan_pos_te' => $opPlanPosTe,
                        'op_plan_pos_cavity' => $opPlanPosCavity,
                        'op_plan_pos_start' => $opPlanPosStart,
                        'op_plan_pos_end' => $opPlanPosEnd,
                        'op_plan_pos_custom_machine_id' => $opPlanPosCustomMachineId,
                        'op_plan_pos_custom_tool_id' => $opPlanPosCustomToolId,
                    ]);
    
                    $customOpPlanPos = collect([]);
                    $opPlanPosName = collect([]);
                    $opPlanPosStatus = collect([]);
                    $opPlanPosTe = collect([]);
                    $opPlanPosCavity = collect([]);
                    $opPlanPosStart = collect([]);
                    $opPlanPosEnd = collect([]);
                    $opPlanPosCustomMachineId = collect([]);
                    $opPlanPosCustomToolId = collect([]);
                }

                $parsedPlanPosName = isset($prod_order['OP_PLAN_POS_NAME']) && !is_array($prod_order['OP_PLAN_POS_NAME']) ? mb_convert_encoding($prod_order['OP_PLAN_POS_NAME'], 'UTF-8', 'UTF-8') : '';

                $customOpPlanPos->add($prod_order['CUSTOM_OP_PLAN_POS']);
                $opPlanPosName->add($parsedPlanPosName);

                $op_plan_pos_status = ProdOrderPosOperationStatus::PLANNED();
                if ($prod_order['CLOSED']) {
                    $op_plan_pos_status = ProdOrderPosOperationStatus::CLOSED();
                } else if ($prod_order['IN_PRODUCTION']) {
                    $op_plan_pos_status = ProdOrderPosOperationStatus::IN_PRODUCTION();
                }

                $opPlanPosStatus->add($op_plan_pos_status);
                $opPlanPosTe->add($prod_order['OP_PLAN_POS_TE']);
                $opPlanPosCavity->add($prod_order['OP_PLAN_POS_CAVITY']);

                $erpDbStartDate = Carbon::createFromTimeString($prod_order['OP_PLAN_POS_START']);
                $erpDbEndDate = Carbon::createFromTimeString($prod_order['OP_PLAN_POS_END']);

                // request from Elias
                if ($erpDbStartDate->year < 2020) {
                    $erpDbStartDate = Carbon::now();
                    $erpDbEndDate = Carbon::now();
                }
                $opPlanPosStart->add($erpDbStartDate->format('Ymd'));
                $opPlanPosEnd->add($erpDbEndDate->format('Ymd'));

                $opPlanPosCustomMachineId->add($prod_order['OP_PLAN_POS_CUSTOM_MACHINE_ID']);
                $opPlanPosCustomToolId->add($prod_order['OP_PLAN_POS_CUSTOM_TOOL_ID']);

                $lastCustomId = $prod_order['CUSTOM_ID'];
                $lastCustomPos = $prod_order['CUSTOM_POS'];
                $lastCustomItemId = $prod_order['CUSTOM_ITEM_ID'];
                $lastQuantity = $prod_order['QUANTITY'];
                $lastStart = Carbon::createFromTimeString($prod_order['POS_START'])->format('Ymd');
                $lastEnd = Carbon::createFromTimeString($prod_order['POS_END'])->format('Ymd');
            }

            if(count($prod_orders)) {
                $records->push([
                    'custom_id' => $lastCustomId,
                    'custom_pos' => $lastCustomPos,
                    'custom_item_id' => $lastCustomItemId,
                    'quantity' => $lastQuantity,
                    'start' => $lastStart,
                    'end' => $lastEnd,
                    'custom_op_plan_pos' => $customOpPlanPos,
                    'op_plan_pos_name' => $opPlanPosName,
                    'op_plan_pos_status' => $opPlanPosStatus,
                    'op_plan_pos_te' => $opPlanPosTe,
                    'op_plan_pos_cavity' => $opPlanPosCavity,
                    'op_plan_pos_start' => $opPlanPosStart,
                    'op_plan_pos_end' => $opPlanPosEnd,
                    'op_plan_pos_custom_machine_id' => $opPlanPosCustomMachineId,
                    'op_plan_pos_custom_tool_id' => $opPlanPosCustomToolId,
                ]);
            }
        }
        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function machineGroups(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function operations(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function boms(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function warehouses(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function stocks(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function callOffs(): Collection
    {
        $records = collect([]);

        return $records;
    }

    public function shiftModels(): Collection
    {
        $records = collect([]);

        return $records->chunk(env('DATA_CHUNK_SIZE'));
    }

    public function capacities($skip, $take): array|false
    {
        return false;
    }

    private function callSoapApiByServiceName($serviceName, $param = 0) {
        $isGroupImport = Cache::get('is_canias_group_import');
        if(!$isGroupImport) {
            $this->setSessionId();
        }
        $sessionId = Cache::get('canias_session_id');
        $securityKey = Cache::get('canias_security_key');
        $response = null;
        if($sessionId && $securityKey) {
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => env('CANIAS_ERP_API_URL'),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS =>'<x:Envelope
                                        xmlns:x="http://schemas.xmlsoap.org/soap/envelope/"
                                        xmlns:web="http://webservice.ias.com">
                                        <x:Header/>
                                        <x:Body>
                                            <web:callService>
                                                <web:SessionId>'.$sessionId.'</web:SessionId>
                                                <web:SecurityKey>'.$securityKey.'</web:SecurityKey>
                                                <web:ServiceId>'.$serviceName.'</web:ServiceId>
                                                <web:Parameters><![CDATA[<PARAMETERS> <PARAM>'.$param.'</PARAM></PARAMETERS>]]></web:Parameters>
                                            
                                                <web:Compressed>0</web:Compressed>
                                                <web:Permanent>0</web:Permanent>
                                                <web:ExtraVariables></web:ExtraVariables>
                                                <web:RequestId>0</web:RequestId>
                                            </web:callService>
                                        </x:Body>
                                    </x:Envelope>',
                CURLOPT_HTTPHEADER => array(
                    'SOAPAction: "#POST"',
                    'Content-Type: application/xml'
                ),
            ));
    
            $response = curl_exec($curl);
            curl_close($curl);
        }
        if(!$isGroupImport) {
            $isLogout = $this->logoutFromServer();
            Log::info('Logout status: ' . $isLogout . ' for session ID: ' . $sessionId . 
                ', Service ID: ' . $serviceName . 
                ', Date and Time: ' . now());
        }
        return $response;
    }

    private function parseSoapResponse($soapXmlRes) {
        $doc = new DOMDocument('1.0', 'utf-8');
        $doc->loadXML($soapXmlRes);
        $xpath = new DOMXPath($doc);
        $XMLresults = $xpath->query('//multiRef[@id="id1"]');
        if ($XMLresults->length > 0) {
            $output = $XMLresults->item(0)->childNodes[0]->nodeValue;
            if($output) {
                $xmlValue = simplexml_load_string($output, "SimpleXMLElement", LIBXML_NOCDATA);
                $jsonString = json_encode($xmlValue, JSON_PRETTY_PRINT);
                $arrayResponse = json_decode($jsonString, true);
                $list = [];
                if(isset($arrayResponse['ROW'][0])) {
                    foreach($arrayResponse['ROW'] as $key=>$val) {
                        $list[] = $val;
                    }
                }else {
                    $list[] = $arrayResponse['ROW'];
                }
                return $list;
            }
        }
        return [];
    }

    private function getCustomerSupplierFilteredData($data): array {
        $customers = [];
        $suppliers = [];
        foreach ($data as $key => $entry) {
            $customId = $entry['CUSTOM_ID'];
            
            // Check if CUSTOM_ID starts with '1'
            if (strpos($customId, '1') === 0) {
                array_push($customers, $entry);
            }
            // Check if CUSTOM_ID starts with '3'
            elseif (strpos($customId, '3') === 0) {
                array_push($suppliers, $entry);
            }
        }
        return ['customers' => $customers, 'suppliers' => $suppliers];
    }
}