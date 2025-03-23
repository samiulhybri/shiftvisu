<?php

namespace App\Console\Commands;

use App\Enums\OfferPhase;
use App\Enums\OfferStatus;
use App\ExternalDataSource\CRMDataSource;
use App\Models\Country;
use App\Models\Customer;
use App\Models\DeliveryTerm;
use App\Models\SalesArea;
use App\Models\SalesGroup;
use App\Models\SalesOpportunity;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SalesOpportunityImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:opportunity';

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
        try {
            $ds = new CRMDataSource();
            $skip = 0;
            $take = env('DATA_CHUNK_SIZE');
            while ($salesOpportunities = $ds->salesOpportunities($skip, $take)) {
                $skip += $take;
                foreach ($salesOpportunities as $salesOpportunity) {
                    //Check if item exists
                    $record = SalesOpportunity::where('custom_id', $salesOpportunity['custom_id'])
                        ->where('version', $salesOpportunity['version'])->first();

                    $createNewSalesOpportunity = false;

                    if (!$record) {
                        $record = new SalesOpportunity();
                        $record->custom_id = $salesOpportunity['custom_id'];
                        $record->version = $salesOpportunity['version'];
                        $createNewSalesOpportunity = true;
                    }

                    if (isset($salesOpportunity['customer_id'])) {
                        $customer = Customer::where('custom_id', $salesOpportunity['customer_id'])->first();
                        if (isset($customer)) {
                            $record->customer_id = $customer->id;
                        }
                    } else {
                        $record->customer_id = null;
                    }

                    $record->contact_person = $salesOpportunity['contact_person'];
                    $record->sales_area_id = $salesOpportunity['sales_area_id'] ? SalesArea::where('crm_id', $salesOpportunity['sales_area_id'])->first()?->id : null;
                    $record->sales_group_id = $salesOpportunity['sales_group_id'] ? SalesGroup::where('crm_id', $salesOpportunity['sales_group_id'])->first()?->id : null;
                    $record->delivery_term_id = $salesOpportunity['delivery_term_id'] ? DeliveryTerm::where('crm_id', $salesOpportunity['delivery_term_id'])->first()?->id : null;
                    $record->country_id = $salesOpportunity['country_id'] ? Country::where('crm_id', $salesOpportunity['country_id'])->first()->id : null;
                    $record->postal_code = $salesOpportunity['postal_code'];
                    $record->destination = $salesOpportunity['destination'];
                    $record->request_date = $salesOpportunity['request_date'];
                    $record->offer_until_date = $salesOpportunity['offer_until_date'];
                    $record->customer_reference = $salesOpportunity['customer_reference'];
                    $record->type = $salesOpportunity['type'];
                    $record->additional_info = $salesOpportunity['additional_info'];
                    $record->changes = $salesOpportunity['changes'];
                    $record->is_short_offer = $salesOpportunity['is_short_offer'];
                    $record->is_specification_necessary = $salesOpportunity['is_specification_necessary'];
                    $record->crm_id = $salesOpportunity['crm_id'];
                    try {
                        if ($record->customer_id) {
                            $record->save();

                            if ($createNewSalesOpportunity) {
                                /**
                                 * Check if exists sales opportunity with version < $salesOpportunity['version']
                                 * If exists check if offer to last version was already created
                                 * If so duplicate offer (with everything related to it, offer_pos, offer_pos_raw_dimensions,
                                 * offer_pos_mechanical_processes, offer_pos_dimension_shaft_upset_parts,
                                 * offer_pos_dimension_upset_part_forged_beams, calculations, calculation_chem_analyses,
                                 * calculation_heat_treatments, calculation_additional_heat_treatments, ...)
                                 * Set crm_id of just duplicated offer to null
                                 * Set phase of just duplicated offer to calculation
                                 * Set phase of "old" offer to archived
                                 */
                                $oldSalesOpportunity = SalesOpportunity::with(['offer.offerPos', 'offer.logs'])
                                    ->where('custom_id', $salesOpportunity['custom_id'])
                                    ->where('version', '<', $salesOpportunity['version'])
                                    ->orderByDesc('version')->first();

                                $oldOffer = $oldSalesOpportunity->offer ?? null;

                                if ($oldOffer) {
                                    DB::beginTransaction();

                                    // Replicate and save old linked offer
                                    $newOffer = $oldOffer->replicate();
                                    $newOffer->sales_opportunity_id = $record->id;
                                    $newOffer->version = $record->version;

                                    // Copy new fields from new sales opportunity to just copied offer just like in offer creation
                                    $newOffer->customer_id = $record->customer_id;
                                    $newOffer->contact_person = $record->contact_person;
                                    $newOffer->sales_area_id = $record->sales_area_id;
                                    $newOffer->sales_group_id = $record->sales_group_id;
                                    $newOffer->request_date = $record->request_date;
                                    $newOffer->offer_until_date = $record->offer_until_date;
                                    $newOffer->customer_reference = $record->customer_reference;
                                    $newOffer->type = $record->type;
                                    $newOffer->additional_info = $record->additional_info;
                                    $newOffer->changes = $record->changes;
                                    $newOffer->is_short_offer = $record->is_short_offer;
                                    $newOffer->is_specification_necessary = $record->is_specification_necessary;

                                    $newOffer->status = OfferStatus::OPEN();
                                    $newOffer->created_at = Carbon::now();
                                    $newOffer->crm_id = null;
                                    $newOffer->phase = OfferPhase::CALC();
                                    $newOffer->save();
                                    $newOfferId = $newOffer->id;

                                    $oldOfferPos = $oldOffer->offerPos;
                                    $oldOfferLogs = $oldOffer->logs;

                                    if ($oldOfferPos) {
                                        foreach ($oldOfferPos as $offerPos) {
                                            // Load related data
                                            $offerPos = $offerPos->load(['calculation', 'offerPosRawDimensions', 'mechanicalProcesses']);

                                            // Replicate and save offer pos
                                            $newOfferPos = $offerPos->replicate();
                                            $newOfferPos->created_at = Carbon::now();
                                            $newOfferPos->offer_id = $newOfferId;
                                            $newOfferPos->save();
                                            $newOfferPosId = $newOfferPos->id;

                                            $calculation = $offerPos->calculation;

                                            // Process calculation
                                            if ($calculation) {
                                                $calculation = $calculation->load(['heatTreatments', 'additionalHeatTreatments', 'chemAnalyses']);

                                                // Replicate and save calculation
                                                $newCalculation = $calculation->replicate();
                                                $newCalculation->created_at = Carbon::now();
                                                $newCalculation->offer_pos_id = $newOfferPosId;
                                                $newCalculation->save();
                                                $newCalculationId = $newCalculation->id;

                                                // Replicate and save heat treatments
                                                if ($calculation->heatTreatments) {
                                                    foreach ($calculation->heatTreatments as $heatTreatment) {
                                                        $newHeatTreatment = $heatTreatment->replicate();
                                                        $newHeatTreatment->created_at = Carbon::now();
                                                        $newHeatTreatment->calculation_id = $newCalculationId;
                                                        $newHeatTreatment->save();
                                                    }
                                                }

                                                // Replicate and save additional heat treatments
                                                if ($calculation->additionalHeatTreatments) {
                                                    foreach ($calculation->additionalHeatTreatments as $additionalHeatTreatment) {
                                                        $newAdditionalHeatTreatment = $additionalHeatTreatment->replicate();
                                                        $newAdditionalHeatTreatment->created_at = Carbon::now();
                                                        $newAdditionalHeatTreatment->calculation_id = $newCalculationId;
                                                        $newAdditionalHeatTreatment->save();
                                                    }
                                                }

                                                // Replicate and save chem analyses
                                                if ($calculation->chemAnalyses) {
                                                    foreach ($calculation->chemAnalyses as $chemAnalysis) {
                                                        $newChemAnalysis = $chemAnalysis->replicate();
                                                        $newChemAnalysis->created_at = Carbon::now();
                                                        $newChemAnalysis->calculation_id = $newCalculationId;
                                                        $newChemAnalysis->save();
                                                    }
                                                }
                                            }

                                            // Replicate and save mechanical processes
                                            if ($offerPos->mechanicalProcesses) {
                                                foreach ($offerPos->mechanicalProcesses as $mechanicalProcess) {
                                                    $newMechanicalProcess = $mechanicalProcess->replicate();
                                                    $newMechanicalProcess->created_at = Carbon::now();
                                                    $newMechanicalProcess->offer_pos_id = $newOfferPosId;
                                                    $newMechanicalProcess->save();
                                                }
                                            }

                                            // Process raw dimensions
                                            if ($offerPos->offerPosRawDimensions) {
                                                foreach ($offerPos->offerPosRawDimensions as $rawDimension) {
                                                    $rawDimension = $rawDimension->load(['rawDimensionTypes', 'offerPosDimensionShaftUpsetParts', 'offerPosDimensionUpsetPartForgedBeams']);

                                                    // Replicate and save raw dimension
                                                    $newRawDimension = $rawDimension->replicate();
                                                    $newRawDimension->created_at = Carbon::now();
                                                    $newRawDimension->offer_pos_id = $newOfferPosId;
                                                    $newRawDimension->save();
                                                    $newRawDimensionId = $newRawDimension->id;

                                                    // Replicate and save raw dimension types
                                                    if ($rawDimension->rawDimensionTypes) {
                                                        foreach ($rawDimension->rawDimensionTypes as $rawDimensionType) {
                                                            $newRawDimensionType = $rawDimensionType->replicate();
                                                            $newRawDimensionType->created_at = Carbon::now();
                                                            $newRawDimensionType->offer_pos_raw_dimensions_id = $newRawDimensionId;
                                                            $newRawDimensionType->save();
                                                        }
                                                    }

                                                    // Replicate and save shaft upset parts
                                                    if ($rawDimension->offerPosDimensionShaftUpsetParts) {
                                                        foreach ($rawDimension->offerPosDimensionShaftUpsetParts as $shaftUpsetPart) {
                                                            $newShaftUpsetPart = $shaftUpsetPart->replicate();
                                                            $newShaftUpsetPart->created_at = Carbon::now();
                                                            $newShaftUpsetPart->offer_pos_raw_dimensions_id = $newRawDimensionId;
                                                            $newShaftUpsetPart->save();
                                                        }
                                                    }

                                                    // Replicate and save upset part forged beams
                                                    if ($rawDimension->offerPosDimensionUpsetPartForgedBeams) {
                                                        foreach ($rawDimension->offerPosDimensionUpsetPartForgedBeams as $upsetPartForgedBeam) {
                                                            $newUpsetPartForgedBeam = $upsetPartForgedBeam->replicate();
                                                            $newUpsetPartForgedBeam->created_at = Carbon::now();
                                                            $newUpsetPartForgedBeam->offer_pos_raw_dimensions_id = $newRawDimensionId;
                                                            $newUpsetPartForgedBeam->save();
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    // Replicate and save old linked offer logs
                                    if ($oldOfferLogs) {
                                        foreach ($oldOfferLogs as $logs) {
                                            $newLogs = $logs->replicate();
                                            $newLogs->loggable_id = $newOfferId;
                                            $newLogs->save();
                                        }
                                    }

                                    // Set phase of "old" offer to archived
                                    $oldOffer->update([
                                        'phase' => OfferPhase::CLOSING(),
                                        'status' => OfferStatus::ARCHIVED()
                                    ]);

                                    DB::commit();
                                }
                            }
                        }
                    } catch (Exception $e) {
                        DB::rollBack();
                        Log::error($e);
                        return 0;
                    }
                }
            }
        } catch (Exception $exception) {
            Log::error($exception);
            return 0;
        }
        return 1;
    }
}
