<?php

namespace App\Http\Controllers\HWEKalk;

use App\Enums\OfferPhase;
use App\Enums\OfferPosProductType;
use App\Enums\OfferPosRejectionType;
use App\Enums\PriceNote;
use App\Helpers\HweKalkAccessToken;
use App\Http\Controllers\Controller;
use App\Models\HweKalkLog;
use App\Models\Offer;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;

class OfferController extends Controller
{
    /**
     * @param Request $request
     * @return JsonResponse
     * Find offer based on Customer crm_id
     * If customer crm_id is null Offer not export to crm
     * For customer crm_id need to import (App\Console\Commands\HweCrmCustomerImport)
     */
    public function exportOffer(Request $request): JsonResponse
    {
        try {
            $offer = Offer::with(['offerPos.material', 'offerPos.calculation.specification'])
                ->join('customers', 'offers.customer_id', 'customers.id')
                ->leftJoin('sales_opportunities', 'offers.sales_opportunity_id', 'sales_opportunities.id')
                ->whereNotNull('customers.crm_id')
                ->where('offers.id', $request->id)
                ->select('customers.crm_id as customer_crm_id', 'offers.crm_id', 'offers.version', 'offers.id as id', 'offers.created_at', 'sales_opportunities.crm_id as sales_opportunity_crm_id', 'offers.custom_id', 'offers.is_package_price', 'offers.sales_note')
                ->first();
            if ($offer) {
                $success = $this->exportOffers($offer);
            } else {
                return response()->json(['success' => false]);
            }
        } catch (RequestException $exception) {
            Log::error($exception);
            $success = false;
        }
        return response()->json(['success' => $success], $success ? 200 : 500);
    }

    /**
     * @param Offer $offer
     * @return bool
     * Export Offer to Crm
     * If Offer already export then update offer to crm
     */
    function exportOffers(Offer $offer): bool
    {
        try {
            $odataServiceUrl = env('CRM_SERVICE_URL') . '/GenerateQuoteFromOpportunity';
            $accessToken = HweKalkAccessToken::getAccessToken();
            $body = [
                "OpportunityId" => $offer->sales_opportunity_crm_id,
                "ColumnSet" => [
                    "AllColumns" => true
                ]
            ];
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Prefer' => 'return=representation',
            ]);

            if ($offer->crm_id) {
                (new SalesOpportunityController())->updatePhaseOpportunity($offer->id, true);

                $this->patchFieldsInQuotes($offer);

                $this->updateCRMLog($offer);

                return $this->exportOfferPos($offer);
            } else {
                $response = $response->post($odataServiceUrl, $body);

                if ($response->status() === 401) {
                    HweKalkAccessToken::invalidateAccessToken();
                    Log::error("CRM Access Token invalid");
                } elseif ($response->status() === 201 || $response->status() === 200) {
                    $offer->update([
                        'crm_id' => json_decode($response->body())->quoteid,
                        'phase' => OfferPhase::CLOSING(),
                    ]);

                    (new SalesOpportunityController())->updatePhaseOpportunity($offer->id, true);

                    $this->patchFieldsInQuotes($offer);

                    $this->updateCRMLog($offer);

                    return $this->exportOfferPos($offer);
                } else {
                    return false;
                }
            }
        } catch (\Exception $exception) {
            Log::error($exception);
        }

        return false;
    }

    private function updateCRMLog($offer)
    {
        $user = Auth::user();
        return HweKalkLog::create([
            "user_id" => $user->id,
            "loggable_id" => $offer->id,
            "entity" => Offer::class,
            "event" => "updateCRM",
            "description" => json_encode($offer)
        ]);
    }

    /**
     * @param Offer $offer
     * @return bool
     * * Export Offer Pos to Crm
     * If Offer Pos already export then update offer pos to crm
     */

    protected function exportOfferPos(Offer $offer): bool
    {
        try {
            $odataServiceUrl = env('CRM_SERVICE_URL') . '/hwe_angebotspositions';
            $accessToken = HweKalkAccessToken::getAccessToken();
            foreach ($offer->offerPos as $offerPos) {
                $body = [
                    "hwe_Angebotid@odata.bind" => "quotes($offer->crm_id)",
                    "hwe_positionsnummer" => (int)$offerPos->pos,
                    "hwe_name" => $offerPos->item_name,
                    "hwe_kundenmaterialnummer" => $offerPos->customer_material_number,
                    "hwe_zgnr" => $offerPos->drawing_id,
                    "hwe_werkstoffbez" => $offerPos->material->name ?? null,
                    "hwe_wstnr" => $offerPos->material->custom_id ?? null,
                    "hwe_spezifikation" => $offerPos->calculation->specification->custom_id ?? null,
                    "hwe_produkttyp" => $this->getProductTypeCrm(OfferPosProductType::from($offerPos->product_type)),
                    "hwe_checktext" => (bool)$offerPos->check_text,
                    "hwe_stckgewichtkg" => $offerPos->delivery_weight,
                    "hwe_menge" => (double)$offerPos->quantity,
                    "hwe_mengeneinheit" => 119980000,
                    "hwe_produktbeschreibung" => $offerPos->calculation->text ?? null,
                    "hwe_abweichungen" => $offerPos->calculation->text2 ?? null,
                    "hwe_postext" => $offerPos->calculation->text3 ?? null,
                    "hwe_abnahmetext" => $offerPos->calculation->text4 ?? null,
                    "hwe_kalkwertstk" => (double)$offerPos->getCost() ?? null,
                    "hwe_preis" => (double)$offerPos->calculation->price ?? null,
                    "hwe_lieferzeitwochen" => (int)$offerPos->calculation->delivery_interval ?? null,
                    "hwe_beauftragt" => (bool)$offerPos->is_commission,
                    "hwe_internebemerkungen" => $offerPos->calculation->internal_note ?? null,
                    "hwe_sap_auftragsnummer" => $offerPos->calculation->sales_order ?? null,
                    "hwe_sap_auftragsposition" => $offerPos->calculation->sales_order_pos ?? null,
                    "hwe_auswahl_preisvermerk" => $this->getPriceNoteCrm(strlen($offerPos->calculation->price_note) > 0 ? PriceNote::from($offerPos->calculation->price_note) : null),
                    "hwe_ablehnen" => (bool)$offerPos->is_rejected,
                    "hwe_ablehnungsgrund" => $this->getRejectionTypeCrm(strlen($offerPos->rejection_type) > 0 ? OfferPosRejectionType::from($offerPos->rejection_type) : null),
                    "hwe_innendurchmesser" => $offerPos->inner_diameter_final,
                    "hwe_aussendurchmesser" => $offerPos->outer_diameter_final ?? $offerPos->max_outer_diameter,
                    "hwe_laenge_mass" => $offerPos->length_final ?? $offerPos->total_length,
                    "hwe_hoehe_mass" => $offerPos->height_final,
                    "hwe_seitea_mass" => $offerPos->side_a_final,
                    "hwe_seiteb_mass" => $offerPos->side_b_final,
                ];
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Prefer' => 'return=representation',
                ]);

                if ($offerPos->crm_id) {
                    $url = $odataServiceUrl . "($offerPos->crm_id)";
                    $response = $response->patch($url, $body);
                } else {
                    $response = $response->post($odataServiceUrl, $body);
                }
                if ($response->status() === 201) {
                    $offerPos->update([
                        'crm_id' => json_decode($response->body())->hwe_angebotspositionid
                    ]);
                } else {
                    Log::warning($response->body());
                }
            }
            return true;
        } catch (\Exception $exception) {
            Log::error($exception);
        }
        return false;
    }

    private function patchFieldsInQuotes(Offer $offer)
    {
        if (!$offer->crm_id)
            return;

        $odataServiceUrl = env('CRM_SERVICE_URL') . "/quotes($offer->crm_id)";
        $accessToken = HweKalkAccessToken::getAccessToken();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
            'Prefer' => 'return=representation',
        ]);

        $body = [
            "hwe_hinweisvertrassistenzaushwekalk" => $offer->sales_note ?? '',
            "hwe_hinweispaketpreis" => (bool)$offer->is_package_price,
            "hwe_hwekalkrev" => $offer->version,
        ];

        try {
            $response->patch($odataServiceUrl, $body);
        } catch (\Exception $e) {
            Log::error($e);
        }
    }

    private function getProductTypeCrm(OfferPosProductType $product_type): int
    {
        return match ($product_type) {
            OfferPosProductType::DISK_PUNCHED() => 119980001,
            OfferPosProductType::RING_CYLINDER() => 119980002,
            OfferPosProductType::RING_ROLLED() => 119980003,
            OfferPosProductType::PIPE() => 119980004,
            OfferPosProductType::BAR_SQUARE() => 119980005,
            OfferPosProductType::BAR_ROUND() => 119980006,
            OfferPosProductType::SOCKET() => 119980007,
            OfferPosProductType::SHAFT() => 119980008,
            OfferPosProductType::UPSET_PART() => 119980009,
            OfferPosProductType::SHAFT_HOLLOW() => 119980010,
            OfferPosProductType::BAR_ROLLED() => 119980011,
            default => 119980000,
        };
    }

    private function getRejectionTypeCrm(?OfferPosRejectionType $rejectionType): ?int
    {
        return match ($rejectionType) {
            OfferPosRejectionType::TO_SMALL() => 119980000,
            OfferPosRejectionType::TO_HEAVY() => 119980001,
            OfferPosRejectionType::NOT_POSSIBLE() => 119980002,
            OfferPosRejectionType::NO_MATERIAL() => 119980003,
            OfferPosRejectionType::TO_RISKY() => 119980004,
            default => null,
        };
    }

    private function getPriceNoteCrm(?PriceNote $priceNote): ?int
    {
        return match ($priceNote) {
            PriceNote::NOTE_3_2() => 119980000,
            PriceNote::NOTE_3_2_MSA() => 119980001,
            PriceNote::MANUAL() => 119980002,
            default => null,
        };
    }
}
