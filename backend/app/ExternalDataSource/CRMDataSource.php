<?php

namespace App\ExternalDataSource;

use App\Enums\SalesOpportunityType;
use App\Helpers\HweKalkAccessToken;
use App\Models\Customer;
use DateTime;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Http;
use SaintSystems\OData\ODataClient;
use Illuminate\Support\Facades\Log;

class CRMDataSource
{
    private $odataClient;

    function __construct()
    {
        $odataServiceUrl = env('CRM_SERVICE_URL');

        $this->odataClient = new ODataClient($odataServiceUrl, function ($request) {
            $accessToken = HweKalkAccessToken::getAccessToken();
            Log::error(HweKalkAccessToken::getAccessToken());
            // OAuth Bearer Token Authentication
            $request->headers['Authorization'] = 'Bearer ' . $accessToken;
        });

    }

    public function salesOpportunities($skip, $take): Collection|false
    {
        if ($skip)
            return false;
        //TODO: retrive data with chunks. we will add it later.
        try {

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . HweKalkAccessToken::getAccessToken(),
            ])->get(env('CRM_SERVICE_URL').'/opportunities?$filter=hwe_prozessphase eq 119980001&$expand=customerid_account,parentcontactid');
            $responseData = json_decode($response->body(), true);
            $opportunities = $responseData['value'] ?? [];
        } catch (RequestException $exception) {
            if ($exception->getCode() == 401) {
                HweKalkAccessToken::invalidateAccessToken();
                Log::error("CRM Access Token invalid");
            } else {
                Log::error($exception);
            }
        }

        $records = collect([]);
        try{
            foreach ($opportunities as $opportunity) {
                $customer_id = $opportunity['customerid_account'];
                $customer_id = $customer_id ? ($customer_id['accountnumber'] ? $customer_id['accountnumber'] : null) : null;

                $contact_person = $opportunity['parentcontactid'];
                $contact_person = $contact_person ? ($contact_person['fullname'] ? $contact_person['fullname'] : null) : null;
                if ($opportunity['hwe_autoincrement']) {
                    $type = SalesOpportunityType::DEMAND();

                    if ($opportunity['hwe_typ'] == 119980001) {
                        $type = SalesOpportunityType::PROJECT();
                    } else if ($opportunity['hwe_typ'] == 119980002) {
                        $type = SalesOpportunityType::ORDER();
                    }

                    $records->push([
                        'custom_id' => $opportunity['hwe_autoincrement'],
                        'version' => $opportunity['hwe_kalkversion'],
                        'contact_person' => $contact_person,
                        'customer_id' => $customer_id,
                        'sales_area_id' => $opportunity['hwe_vertriebsgebiet'],
                        'sales_group_id' => $opportunity['hwe_vertriebsteam'],
                        'delivery_term_id' => $opportunity['hwe_incoterms'],
                        'country_id' => $opportunity['hwe_land'],
                        'postal_code' => $opportunity['hwe_lieferplz'],
                        'destination' => $opportunity['hwe_lieferbedingungen'],
                        'request_date' => new DateTime($opportunity['hwe_anfragedatum']),
                        'offer_until_date' => new DateTime($opportunity['hwe_angebotbis']),
                        'customer_reference' => $opportunity['hwe_anfragenummer'],
                        'type' => $type,
                        'additional_info' => substr($opportunity['customerneed'], 0 , 254),
                        'changes' => $opportunity['hwe_korrekturaenderungswunsch'] ?? '',
                        'is_short_offer' => $opportunity['hwe_angebotinkurzversion'] ?? false,
                        'is_specification_necessary' => $opportunity['hwe_technischebeurteilungnotwendig'] ?? false,
                        'crm_id' => $opportunity['opportunityid'],
                    ]);
                }
            }
            return new Collection($records);
        }
       catch (\Exception $exception) {
        Log::error($exception);
        return false;
        }
    }

    public function customerImport()
    {
        try {
            return $this->odataClient
                ->from('accounts')
                ->get();
        } catch (RequestException $exception) {
            if ($exception->getCode() == 401) {
                HweKalkAccessToken::invalidateAccessToken();
                Log::error("CRM Access Token invalid");
            } else {
                Log::error($exception);
            }
            return false;
        }
    }


    public function exportCustomers(Collection $customers): bool
    {
        foreach ($customers as $customer) {
            if ($customer instanceof Customer) {
                $this->exportCustomer($customer);
            }
        }

        return true;
    }

    public function exportCustomer(Customer $customer)
    {
        try {

            $odataServiceUrl = env('CRM_SERVICE_URL') . '/accounts';
            $accessToken = HweKalkAccessToken::getAccessToken();
            $body = [
                'name' => $customer->name,
                'accountnumber' => $customer->custom_id,
                'qss_name2' => $customer->name2 ?? '',
                'address1_line1' => $customer->address ?? '',
                'address1_postalcode' => $customer->postal_code ?? '',
                'address1_city' => $customer->city ?? '',
                'telephone1' => $customer->telephone ?? '',
                'qss_vatno' => $customer->vat ?? '',
                'hwe_lieferantennummer' => $customer->name2 ?? '',
                'hwe_versicherungssumme' => $customer->total_insured ?? 0,
                'hwe_zahlungsbedingungen' => $customer->paymentTerm->name ?? '',
                'hwe_aktuellerauftragsbestandinderfertigung' => $customer->total_production ?? 0,
                'hwe_summeaktuelloffenerposten' => $customer->total_outstanding ?? 0,
                'hwe_istumsatzbisheute' => $customer->total_revenue ?? 0,
            ];

            if (intval($customer->country?->crm_id))
                $body['qss_country'] = intval($customer->country?->crm_id);
            if (intval($customer->salesGroup?->crm_id))
                $body['hwe_vertriebsteam'] = intval($customer->salesGroup?->crm_id);
            if (intval($customer->salesArea?->crm_id))
                $body['hwe_vertriebsgebiet'] = intval($customer->salesArea?->crm_id);
            if (intval($customer->customerGroup?->crm_id))
                $body['hwe_geschaeftsbeziehungstyp'] = intval($customer->customerGroup?->crm_id);
            if (intval($customer->sector?->crm_id))
                $body['hwe_primaerebranche'] = intval($customer->sector?->crm_id);
            if (intval($customer->deliveryTerm?->crm_id))
                $body['hwe_incoterms'] = intval($customer->deliveryTerm?->crm_id);

            $httpClient = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Prefer' => 'return=representation',
            ]);

            if ($customer->crm_id) {
                $odataServiceUrl .= "($customer->crm_id)";
                $response = $httpClient->patch($odataServiceUrl, $body);
            } else {
                $response = $httpClient->post($odataServiceUrl, $body);
            }

            if ($response->status() === 401) {
                HweKalkAccessToken::invalidateAccessToken();
                Log::error("CRM Access Token invalid");
            } elseif ($response->status() === 201) {
                $customer->crm_id = json_decode($response->body())->accountid;
                $customer->save();
                return true;
            } elseif ($response->status() === 200) {
                return true;
            } else {
                Log::error($response);
                return false;
            }
        } catch (\Exception $exception) {
            Log::error($exception);
        }
        return false;
    }
}
