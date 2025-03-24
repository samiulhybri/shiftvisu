<?php

namespace App\ExportStrategies;

use App\Contracts\ExportStrategy;
use App\Models\DataExport;
use Illuminate\Support\Facades\Log;
use SimpleXMLElement;

class ADKExportStrategy extends ExportStrategy
{
    public function exportOperationQuantities(DataExport $dataExport): ExportResult
    {
        # LOG DIVIDER
        Log::channel('adk_export')->info("===================================================================================================");

        $tokenResponse = $this->loginServer();
        $isSuccess = false;
        $message = 'Server login failed!';
        $method = 'POST';
        $httpUrl = env('CANIAS_ERP_API_URL');
        $httpPayload = null;

        if($tokenResponse['session_id'] != '' && $tokenResponse['security_key'] != '') {
            # Log Login Success Message
            Log::channel('adk_export')->info("LOGIN SUCCESS. TOKEN: " . json_encode($tokenResponse) . ", TIME: " . now());

            # Log the parameters
            Log::channel('adk_export')->info("PARAMETERS: " . $dataExport->data);

            $exportData = json_decode($dataExport->data);

            $xmlString = '<x:Envelope
                xmlns:x="http://schemas.xmlsoap.org/soap/envelope/"
                xmlns:web="http://webservice.ias.com">
                <x:Header/>
                <x:Body>
                    <web:callService>
                        <web:SessionId>'.$tokenResponse['session_id'].'</web:SessionId>
                        <web:SecurityKey>'.$tokenResponse['security_key'].'</web:SecurityKey>
                        <web:ServiceId>'.htmlspecialchars($exportData->ServiceId).'</web:ServiceId>
                        <web:Parameters><![CDATA[<PARAMETERS>
                        <PARAM>' . htmlspecialchars($exportData->production_action_value) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->company_id) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->plant_id) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->machine_custom_id) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->production_type) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->prod_order_custom_id) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->pos) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->prod_confimation_number ?? '%') . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->good_qty) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->scrap_qty) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->rework_qty) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->rework_code ?? '%') . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->failure_code ?? '%') . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->fire_code ?? '%') . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->user_id) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->operation_status) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->start_time) . '</PARAM>
                        <PARAM>' . htmlspecialchars($exportData->end_time) . '</PARAM>
                        </PARAMETERS>]]></web:Parameters>
                    
                        <web:Compressed>0</web:Compressed>
                        <web:Permanent>0</web:Permanent>
                        <web:ExtraVariables></web:ExtraVariables>
                        <web:RequestId>0</web:RequestId>
                    </web:callService>
                </x:Body>
            </x:Envelope>';

            // Send cURL request
            $response = $this->sendCurlRequest(env('CANIAS_ERP_API_URL'), $xmlString);

            if ($response['error']) {
                $isSuccess = false;
                $message = 'Data export failed: ' . $response['error'];
                $httpPayload = $response["error"];
            } else {
                $isSuccess = true;
                $message = 'Data exported successfully';
                $httpPayload = $response["response"];

                # Log Canias Reponse
                Log::channel('adk_export')->info("CANIAS RESPONSE: " . $httpPayload);
            }

            $logoutSuccess = $this->logoutFromServer($tokenResponse['session_id']);
            if (!$logoutSuccess) {
                Log::warning('Logout failed for session ID: ' . $tokenResponse['session_id'] . 
                             ', Service ID: ' . $exportData->ServiceId . 
                             ', Date and Time: ' . now());
            } else {
                # Log logout message
                Log::channel('adk_export')->info("LOGOUT SUCCESS. TOKEN: " . json_encode($tokenResponse) . ", TIME: " . now());
            }
        }
        return new ExportResult(
            $isSuccess, 
            $message, 
            $method, 
            $httpUrl, 
            $httpPayload
        );
    }

    // cURL Request handler
    private function sendCurlRequest($url, $payload)
    {
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'SOAPAction: "#POST"',
                'Content-Type: application/xml'
            ],
        ]);

        $response = curl_exec($curl);
        $error = curl_error($curl);
        curl_close($curl);

        return ['response' => $response, 'error' => $error];
    }

    // Login to CANIAS ERP system
    private function loginServer()
    {
        $response = $this->sendCurlRequest(env('CANIAS_ERP_API_URL'), '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
            <Body>
                <login xmlns="http://webservice.ias.com">
                    <Client>00</Client>
                    <Language>T</Language>
                    <DBServer>CANIAS</DBServer>
                    <DBName>' . env('CANIAS_ERP_DB_NAME') . '</DBName>
                    <ApplicationServer>' . env('CANIAS_ERP_APPLICATION_SERVER') . '</ApplicationServer>
                    <Username>' . env('CANIAS_ERP_USER_NAME') . '</Username>
                    <Password>' . env('CANIAS_ERP_PASSWORD') . '</Password>
                    <Encrypted>0</Encrypted>
                    <Compression>0</Compression>
                    <LCheck></LCheck>
                    <VKey></VKey>
                </login>
            </Body>
        </Envelope>');

        $sessionId = '';
        $securityKey = '';

        if ($response['response']) {
            $xmlObject = simplexml_load_string($response['response'], "SimpleXMLElement", LIBXML_NOCDATA);
            $namespaces = $xmlObject->getNamespaces(true);
            $body = $xmlObject->children($namespaces['soapenv'])->Body;
            $multiRef = $body->children()->multiRef;
            $jsonString = json_encode($multiRef, JSON_PRETTY_PRINT);
            $result = json_decode($jsonString, true);

            if ($result['Success'] === "true") {
                $sessionId = $result['SessionId'];
                $securityKey = $result['SecurityKey'];
            }
        }

        return ["session_id" => $sessionId, 'security_key' => $securityKey];
    }

    // Logout from CANIAS ERP system
    private function logoutFromServer($sessionId)
    {
        $response = $this->sendCurlRequest(env('CANIAS_ERP_API_URL'), '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://webservice.ias.com">
            <x:Header/>
            <x:Body>
                <web:logout>
                    <web:SessionId>' . htmlspecialchars($sessionId) . '</web:SessionId>
                </web:logout>
            </x:Body>
        </x:Envelope>');

        // Check if the response is successful
        if (!$response || !$response['response']) {
            return false;
        }

        try {
            $xml = new SimpleXMLElement($response['response']);
            $xml->registerXPathNamespace('soapenv', 'http://schemas.xmlsoap.org/soap/envelope/');
            $xml->registerXPathNamespace('ns1', 'http://webservice.ias.com');
    
            $logoutResponseNodes = $xml->xpath('//ns1:logoutResponse');
    
            // If there are no logout response nodes, return false
            if (empty($logoutResponseNodes)) {
                return false;
            }

            // Convert the first logoutResponse node to JSON and then decode it to an array
            $jsonString = json_encode($logoutResponseNodes[0], JSON_PRETTY_PRINT);
            $result = json_decode($jsonString, true);

            // Return the 'logoutReturn' value if it exists, otherwise return false
            return isset($result['logoutReturn']) ? $result['logoutReturn'] : false;
    
        } catch (\Exception $e) {
            return false;
        }
    }

}