<?php

namespace App\Services;

use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Http;

class ImportFromBTPService
{
    private $client;
    private $VCAP_ENV;

    private $destinationData = [];
    private $connectivityData = null;
    private $cookie = null;
    private $csrfToken = null;

    public function __construct()
    {
        $this->client = new Client();

        if (env('APP_ENV') !== 'local' && !env('V10_ENABLED')) {
            $this->VCAP_ENV = json_decode(env('VCAP_SERVICES'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid VCAP_SERVICES environment variable');
            }
        }
    }

    private function getToken($tokenUrl, $clientId, $clientSecret)
    {
        if (empty($tokenUrl) || empty($clientId) || empty($clientSecret)) {
            throw new \Exception('Token URL, Client ID, or Client Secret is missing');
        }

        try {
            $response = $this->client->post($tokenUrl, [
                'form_params' => [
                    'grant_type' => 'client_credentials',
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                ],
            ]);

            $body = json_decode((string)$response->getBody(), true);

            return $body['access_token'] ?? null;
        } catch (RequestException $e) {
            return null;
        }
    }

    public function getDestinationData($destinationName)
    {
        if (isset($this->destinationData[$destinationName])) {
            return $this->destinationData[$destinationName];
        }

        if (empty($this->VCAP_ENV['destination'][0]['credentials'])) {
            throw new \Exception('Destination credentials are missing');
        }

        $destination = $this->VCAP_ENV['destination'][0]['credentials'];
        $tokenUrl = $destination['url'] . '/oauth/token';
        $clientId = $destination['clientid'];
        $clientSecret = $destination['clientsecret'];
        $apiUrl = $destination['uri'] . '/destination-configuration/v1/destinations/' . $destinationName;

        // Get destination token
        $token = $this->getToken($tokenUrl, $clientId, $clientSecret);

        if ($token) {
            try {
                // Get destination configuration
                $response = $this->client->get($apiUrl, [
                    'headers' => [
                        'Authorization' => "Bearer {$token}",
                    ],
                ]);

                return $this->destinationData[$destinationName] = json_decode((string)$response->getBody(), true);
            } catch (RequestException $e) {
                return null;
            }
        }

        return null;
    }

    public function getConnectivityData()
    {
        if ($this->connectivityData) {
            return $this->connectivityData;
        }

        if (empty($this->VCAP_ENV['connectivity'][0]['credentials'])) {
            throw new \Exception('Connectivity credentials are missing');
        }

        $connectivity = $this->VCAP_ENV['connectivity'][0]['credentials'];
        $tokenUrl = $connectivity['url'] . '/oauth/token';
        $clientId = $connectivity['clientid'];
        $clientSecret = $connectivity['clientsecret'];

        return $this->connectivityData = $this->getToken($tokenUrl, $clientId, $clientSecret);
    }

    public function executeHttpRequestInBtp($apiPart, $destinationName, $method = "get", $body = null, $urlIfMatch = null, int $timeout = 30)
    {
        if (env('APP_ENV') == 'local') {
            // only 'get' supported
            if ($method !== 'get') {
                throw new \Exception('Only GET method is supported in local environment');
            }
            return $this->getDataFromLocalEnv($apiPart);
        } else {
            return $this->getDataFromProductionMode($apiPart, $destinationName, $method, $body, $urlIfMatch, $timeout);
        }
    }

    private function getDataFromProductionMode($apiPart, $destinationName, $method = "get", $body = null, $urlIfMatch = null, int $timeout = 30)
    {
        $destination = $this->getDestinationData($destinationName);
        $connectivityToken = $this->getConnectivityData();

        if (empty($this->VCAP_ENV['connectivity'][0]['credentials'])) {
            throw new Exception('Connectivity credentials are missing');
        }

        if (empty($destination) || empty($connectivityToken) || empty($apiPart)) {
            throw new Exception('Invalid input parameters');
        }

        // Get On Premise proxy host and port
        $proxyHost = $this->VCAP_ENV['connectivity'][0]['credentials']['onpremise_proxy_host'];
        $proxyPort = $this->VCAP_ENV['connectivity'][0]['credentials']['onpremise_proxy_port'];

        // Prepare headers for the request
        if($destination && key_exists('authTokens', $destination)) {
            $headers = [
                'Authorization' => 'Basic ' . $destination['authTokens'][0]['value'],
                'Proxy-Authorization' => 'Bearer ' . $connectivityToken,
                'SAP-Connectivity-SCC-Location_ID' => $destination['destinationConfiguration']['CloudConnectorLocationId'],
                'Accept' => 'application/json'
            ];
        } else {
            $headers = [
                'Proxy-Authorization' => 'Bearer ' . $connectivityToken,
                'SAP-Connectivity-SCC-Location_ID' => $destination['destinationConfiguration']['CloudConnectorLocationId'],
                'Accept' => 'application/json'
            ];
        }

        $url = $destination['destinationConfiguration']['URL'];

        if (!str_ends_with($url, '/')) {
            $url .= '/';
        }

        $completeApi = $url . $apiPart;

        $ifMatch = null;
        if($urlIfMatch) {
            $getUrl = $url . $urlIfMatch;
            $ifMatch = Http::withHeaders($headers)
                ->withOptions(['proxy' => $proxyHost . ':' . $proxyPort])
                ->get($getUrl)->header('etag');
        }

        if (strtolower($method) == "post" || strtolower($method) == "put" || strtolower($method) == "delete" || strtolower($method) == "patch") {
            if ($this->cookie == null || $this->csrfToken == null) {
                $cookieRequest = Http::withHeaders([...$headers, 'x-csrf-token' => 'fetch'])
                    ->withOptions(['proxy' => $proxyHost . ':' . $proxyPort])
                    ->get($completeApi);
                $this->cookie = collect($cookieRequest->cookies()->toArray())->map(function ($cookie) {
                    return $cookie['Name'] . '=' . $cookie['Value'];
                })->implode('; ');
                $this->csrfToken = $cookieRequest->header('x-csrf-token');
            }
            $headers['Cookie'] = $this->cookie;
            $headers['x-csrf-token'] = $this->csrfToken;

            if ($ifMatch)
                $headers['If-Match'] = $ifMatch;

            return Http::withHeaders($headers)
                ->timeout($timeout)
                ->withOptions(['proxy' => $proxyHost . ':' . $proxyPort])
                ->{$method}($completeApi, $body);
        } else {
            return Http::withHeaders($headers)
                ->withOptions(['proxy' => $proxyHost . ':' . $proxyPort])
                ->{$method}($completeApi);
        }
    }

    public function getDataFromLocalEnv($apiPart)
    {
        // Base URL for the BTP API
        $baseUrl = env('BTP_API') . "/api/import-from-btp";

        // Define the payload
        $payload = [
            'additionalQuery' => $apiPart
        ];

        // Make the POST request with the payload
        return Http::post($baseUrl, $payload);
    }
}
