<?php

namespace App\Http\Controllers\HWEKalk;

use App\Helpers\HweKalkAccessToken;
use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\OfferPos;
use App\Models\SalesOpportunity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SalesOpportunityController extends Controller
{
    public function index(Request $request)
    {
        try {
            $salesOpportunities = SalesOpportunity::whereDoesntHave('offer')
                ->with(['customer', 'salesArea', 'salesGroup', 'deliveryTerm', 'country'])
                ->select('id', 'custom_id', 'customer_id', 'contact_person', 'request_date', 'offer_until_date', 'customer_reference', 'sales_area_id', 'sales_group_id', 'delivery_term_id', 'country_id')
                ->addSelect('is_specification_necessary', 'created_at', 'updated_at', 'version', 'phase', 'status', 'type', 'additional_info', 'changes', 'is_short_offer', 'postal_code', 'destination')
                ->addSelect(DB::raw("1 as is_sales_opportunity"))
                ->get();
            return response()->json([
                'salesOpportunities' => $salesOpportunities
            ], 200);
        } catch (\Exception $e) {
            return response()->json([], 500);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */

    public function updateCrm(Request $request): JsonResponse
    {
        $id = $request->input('id');

        return $this->updatePhaseOpportunity($id);
    }

    /**
     * @param Offer $offer
     * @param string $origin
     * @return array
     */
    protected function prepareRequestBody(Offer $offer): array
    {
        $origin = request()->header('Origin') ?? '';
        $body = [];

        if ($offer->phase) {
            $body["hwe_phasehwekalk"] = $this->getPhase($offer->phase);
        }

        $body["hwe_linkzuhwekalk"] = "{$origin}/v11/de/hwe-kalk/offer-details/{$offer->id}";

        return $body;
    }

    /**
     * @param string $phase
     * @return int|null
     */
    protected function getPhase(string $phase): int|null
    {
        return [
            "TECHN_ASSESSMENT" => 119980001,
            "CALC" => 119980002,
            "CALC_MECH_ED" => 119980003,
            "OBTAIN_EXTERNAL_QUOTE" => 119980004,
            "QUOTATION_CREATION" => 119980005,
            "CLOSING" => 119980006
        ][$phase] ?? null; // return 0 if phase is not found
    }

    protected function exportOfferPos(OfferPos $offerPos): bool
    {
        try {
            $odataServiceUrl = env('CRM_SERVICE_URL') . '/hwe_angebotspositions';
            $accessToken = HweKalkAccessToken::getAccessToken();

            $body = [
                "hwe_beauftragt" => (bool)$offerPos->is_commission,
                "hwe_sap_auftragsnummer" => $offerPos->calculation->sales_order ?? null,
                "hwe_sap_auftragsposition" => $offerPos->calculation->sales_order_pos ?? null,
            ];
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Prefer' => 'return=representation',
            ]);

            $odataServiceUrl .= "($offerPos->crm_id)";
            $response = $response->patch($odataServiceUrl, $body);

            return $response->successful();
        } catch (\Exception $exception) {
            Log::error($exception);
        }
        return false;
    }

    /**
     * @param mixed $id
     * @param array|string|null $origin
     * @return JsonResponse
     */
    public function updatePhaseOpportunity(int $offerId, bool $onlyOpportunity = false): JsonResponse
    {
        try {
            $accessToken = HweKalkAccessToken::getAccessToken();
            $offer = Offer::with('salesOpportunity:id,crm_id')
                ->select('sales_opportunity_id', 'phase', 'id')
                ->where('id', $offerId)
                ->orderBy('version', 'desc')
                ->first();

            if (!$offer || !$offer->salesOpportunity?->crm_id) {
                return response()->json(['error' => 'Sales Opportunity not found'], 404);
            }

            if(!$onlyOpportunity) {
                foreach ($offer->offerPos()->whereNotNull("crm_id")->get() as $offerPos) {
                    $this->exportOfferPos($offerPos);
                }
            }

            $body = $this->prepareRequestBody($offer);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Prefer' => 'return=representation',
            ])->patch(env('CRM_SERVICE_URL') . '/opportunities(' . $offer->salesOpportunity->crm_id . ')', $body);

            if ($response->status() === 401) {
                HweKalkAccessToken::invalidateAccessToken();
                Log::error("CRM Access Token invalid");
            }

            return response()->json(['success' => true, 'message' => 'CRM updated successfully']);
        } catch (\Exception $exception) {
            Log::error($exception);
            return response()->json(['error' => 'An error occurred while updating CRM'], 500);
        }
    }
}
