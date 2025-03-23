<?php

namespace App\Http\Controllers\HWEKalk;

use App\Enums\MaterialAnalysisMeltingType;
use App\Enums\OfferPosProductType;
use App\Http\Controllers\Controller;
use App\Http\Controllers\IdGeneratorController;
use App\Models\Calculation;
use App\Models\CalculationAdditionalHeatTreatment;
use App\Models\CalculationDocumentation;
use App\Models\CalculationHeatTreatment;
use App\Models\CalculationMetallography;
use App\Models\CalculationNonDestructiveTesting;
use App\Models\CalculationResidualMaterial;
use App\Models\CalculationTestingScope;
use App\Models\Offer;
use App\Models\OfferPos;
use App\Models\OfferPosDimensionShaftUpsetPart;
use App\Models\OfferPosDimensionUpsetPartForgedBeam;
use App\Models\OfferPosMechanicalProcess;
use App\Models\OfferPosRawDimension;
use App\Models\OperationPlan;
use App\Models\OperationPlanPos;
use App\Models\OperationPlanPosHeatTreatment;
use App\Models\ProdOrderPos;
use App\Models\RawDimensionType;
use Carbon\Carbon;
use DateTime;
use DateTimeZone;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PDF;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\Http;
use App\Enums\OfferPosStatus;
use App\Models\CalculationDeformation;
use App\Models\CalculationHardenabilityRange;
use App\Models\CalculationMaterialAnalysis;
use App\Models\MtNorm;
use App\Models\PtNorm;
use App\Models\VtNorm;
use ZipArchive;
class OfferPosController extends Controller
{

    public function getOfferPos(Request $request)
    {
        $offerPosId = $request->offer_pos['id'] ?? null;
        $offerPos = OfferPos::join('offers', 'offer_pos.offer_id', '=', 'offers.id')
            ->where('offer_pos.customer_material_number', $request->offer_pos['customer_material_number'])
            ->where('offers.customer_id', $request->offer['customer_id'])
            ->when($offerPosId, function ($q) use ($offerPosId) {
                return $q->whereNot('offer_pos.id', $offerPosId);
            })
            ->with(['material:id:custom_id', 'offer:id,custom_id', 'calculation:id', 'calculation.heatTreatmentPosTen:id,type'])
            ->select('offer_pos.*', 'offers.custom_id')
            ->get();
        return response()->json([
            'offerPos' => $offerPos,
            'offer' => $request->offer
        ], 200);
    }


    public function copyData(Request $request)
    {
        DB::beginTransaction();
        try {
            # offer pos is witch want to copy $request->offer_pos['id']
            $sourceOfferPos = OfferPos::where('id', $request->offer_pos['id'])
                ->select('offer_pos.*')
                ->first();
            $offer = $request->offer;
            # original id where copy data
            $offerPosId = $request->offer_pos_id ?? null;
            if ($sourceOfferPos) {
                #if  offer not found then create offer
                if (!isset($offer['id'])) $offer = $this->createOffer($offer);
                #if  offer pos not found then create offer
                $offerPos = $this->createOfferPos($request->offer_pos, $sourceOfferPos, $offer, $offerPosId);
                $offerPosId = $offerPos->id;
            }
            if ($sourceOfferPos && $offerPosId) {
                $this->copyCalculations($sourceOfferPos, $offerPosId, $request);
                $this->copyDimension($sourceOfferPos, $offerPosId);
                $this->copyMedia($sourceOfferPos, $offerPosId);
                $this->mechanicalProcesses($sourceOfferPos, $offerPosId);
            }
            DB::commit();

            return response()->json([
                "success" => (bool)$sourceOfferPos,
                'offerPosId' => $offerPos['id'] ?? ($request->offer_pos['id'] ?? null),
                'offer' => $offer
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e);
            return response()->json(["success" => false], 500);
        }

    }

    /**
     * @param $offer
     * @return mixed
     */
    protected function createOffer($offer): mixed
    {
        return Offer::create([
            'custom_id' => $offer['custom_id'] ?? IdGeneratorController::generateId('Offer'),
            'sales_opportunity_id' => isset($offer['salesOpportunity']) ? $offer['salesOpportunity']['id'] : null,
            'customer_id' => $offer['customer_id'] ?? null,
            'contact_person' => $offer['contact_person'] ?? null,
            'sales_area_id' => $offer['sales_area_id'] ?? null,
            'sales_group_id' => $offer['sales_group_id'] ?? null,
            'request_date' => isset($offer['request_date']) ? Carbon::parse($offer['request_date'])->format('Y-m-d') : null,
            'offer_until_date' => isset($offer['offer_until_date']) ? Carbon::parse($offer['offer_until_date'])->format('Y-m-d') : null,
            'customer_reference' => $offer['customer_reference'] ?? null,
            'type' => $offer['type'] ?? null,
            'additional_info' => $offer['additional_info'] ?? null,
            'changes' => $offer['changes'] ?? null,
            'is_specification_necessary' => $offer['is_specification_necessary'] ?? null,
            'is_short_offer' => $offer['is_short_offer'] ?? null,
            'status' => $offer['status'] ?? null,
            'phase' => $offer['phase'] ?? null
        ]);
    }

    /**
     * @param $offerPos
     * @param $sourceOfferPos
     * @param $offer
     * @param $originalOfferPosId
     * @return mixed
     */
    protected function createOfferPos($offerPos, $sourceOfferPos, $offer, $originalOfferPosId): mixed
    {

        if ($originalOfferPosId) {
            $newOffer = OfferPos::find($originalOfferPosId);
            $newOffer->offer_id = $offer['id'];
            $newOffer->pos = $offerPos['pos'];
            $newOffer->customer_material_number = $sourceOfferPos->customer_material_number;
            $newOffer->item_name = $sourceOfferPos->item_name;
            $newOffer->quantity = $sourceOfferPos->quantity;
            $newOffer->drawing_id = $sourceOfferPos->drawing_id;
            $newOffer->product_type = $sourceOfferPos->product_type;
            $newOffer->material_id = $sourceOfferPos->material_id;
            $newOffer->delivery_state = $sourceOfferPos->delivery_state;
            $newOffer->min_allowance_outer_diameter_final = $sourceOfferPos->min_allowance_outer_diameter_final;
            $newOffer->max_allowance_outer_diameter_final = $sourceOfferPos->max_allowance_outer_diameter_final;
            $newOffer->min_allowance_side_a_final = $sourceOfferPos->min_allowance_side_a_final;
            $newOffer->max_allowance_side_a_final = $sourceOfferPos->max_allowance_side_a_final;
            $newOffer->min_allowance_side_b_final = $sourceOfferPos->min_allowance_side_b_final;
            $newOffer->max_allowance_side_b_final = $sourceOfferPos->max_allowance_side_b_final;
            $newOffer->min_allowance_inner_diameter_final = $sourceOfferPos->min_allowance_inner_diameter_final;
            $newOffer->max_allowance_inner_diameter_final = $sourceOfferPos->max_allowance_inner_diameter_final;
            $newOffer->min_allowance_height_final = $sourceOfferPos->min_allowance_height_final;
            $newOffer->max_allowance_height_final = $sourceOfferPos->max_allowance_height_final;
            $newOffer->max_allowance_length_final = $sourceOfferPos->max_allowance_length_final;
            $newOffer->outer_diameter_surface_final = $sourceOfferPos->outer_diameter_surface_final;
            $newOffer->side_a_surface_final = $sourceOfferPos->side_a_surface_final;
            $newOffer->side_b_surface_final = $sourceOfferPos->side_b_surface_final;
            $newOffer->inner_diameter_surface_final = $sourceOfferPos->inner_diameter_surface_final;
            $newOffer->height_surface_final = $sourceOfferPos->height_surface_final;
            $newOffer->length_surface_final = $sourceOfferPos->length_surface_final;
            $newOffer->outer_diameter_final = $sourceOfferPos->outer_diameter_final;
            $newOffer->inner_diameter_final = $sourceOfferPos->inner_diameter_final;
            $newOffer->side_a_final = $sourceOfferPos->side_a_final;
            $newOffer->side_b_final = $sourceOfferPos->side_b_final;
            $newOffer->height_final = $sourceOfferPos->height_final;
            $newOffer->length_final = $sourceOfferPos->length_fina;
            $newOffer->total_length = $sourceOfferPos->total_length;
            $newOffer->max_outer_diameter = $sourceOfferPos->max_outer_diameter;
            $newOffer->length_encore_info = $sourceOfferPos->length_encore_info;
            $newOffer->outer_diameter_encore_info = $sourceOfferPos->outer_diameter_encore_info;
            $newOffer->is_rejected = $sourceOfferPos->is_rejected;
            $newOffer->rejection_type = $sourceOfferPos->rejection_type;
            $newOffer->offer_pos_id_copy_from = $sourceOfferPos->id;
            $newOffer->item_id = $sourceOfferPos->item_id;
            $newOffer->tool_id = $sourceOfferPos->tool_id;
            $newOffer->has_mechanical_drilling = $sourceOfferPos->has_mechanical_drilling;
            $newOffer->drilling_diameter = $sourceOfferPos->drilling_diameter;
            $newOffer->check_text = $sourceOfferPos->check_text;
            $newOffer->show_mechanical_values = $sourceOfferPos->show_mechanical_values;
            $newOffer->has_no_contour = $sourceOfferPos->has_no_contour;
            $newOffer->length_tolerance = $sourceOfferPos->length_tolerance;
            $newOffer->height_tolerance = $sourceOfferPos->height_tolerance;
            $newOffer->side_b_tolerance = $sourceOfferPos->side_b_tolerance;
            $newOffer->side_a_tolerance = $sourceOfferPos->side_a_tolerance;
            $newOffer->inner_tolerance = $sourceOfferPos->inner_tolerance;
            $newOffer->outer_tolerance = $sourceOfferPos->outer_tolerance;
            $newOffer->rust_protection_type = $sourceOfferPos->rust_protection_type;
            $newOffer->is_specification_needed = $sourceOfferPos->is_specification_needed;
            $newOffer->length_upper_tolerance = $sourceOfferPos->length_upper_tolerance;
            $newOffer->length_lower_tolerance = $sourceOfferPos->length_lower_tolerance;
            $newOffer->outer_diameter_upper_tolerance = $sourceOfferPos->outer_diameter_upper_tolerance;
            $newOffer->outer_diameter_lower_tolerance = $sourceOfferPos->outer_diameter_lower_tolerance;
            $newOffer->has_forged_drilling = $sourceOfferPos->has_forged_drilling;
            $newOffer->is_extruded = $sourceOfferPos->is_extruded;
            $newOffer->is_hollow_punching = $sourceOfferPos->is_hollow_punching;
            $newOffer->tool_id_2 = $sourceOfferPos->tool_id_2;
            $newOffer->tool_id_3 = $sourceOfferPos->tool_id_3;
            $newOffer->status = OfferPosStatus::AV();
            $newOffer->save();
        } else {
            $newOffer = $sourceOfferPos->replicate(['id', 'status', 'is_commission']);
            $newOffer->offer_id = $offer['id'];
            $newOffer->status = OfferPosStatus::AV();
            $newOffer->pos = $offerPos['pos'];
            $newOffer->offer_pos_id_copy_from = $sourceOfferPos->id;
            $newOffer->save();
        }
        return $newOffer;

    }

    public function copyMedia($sourceOfferPos, $offerPosId)
    {
        Media::where('model_type', OfferPos::class)->where('model_id', $offerPosId)->delete();
        Media::where('model_type', OfferPos::class)
            ->where('model_id', $sourceOfferPos->id)
            ->get()->each(function ($media) use ($offerPosId) {
                $new = $media->replicate(['id', 'model_id']);
                $new->model_id = $offerPosId;
                $new->uuid = Str::uuid();
                $new->save();
                $this->copyMediaData($media, $new);
            });
    }


    /**
     * @param $sourceOfferPos
     * @param $offerPosId
     * @return void
     */
    protected function copyDimension($sourceOfferPos, $offerPosId): void
    {
        OfferPosRawDimension::where('offer_pos_id', $offerPosId)
            ->delete();
        OfferPosRawDimension::where('offer_pos_id', $sourceOfferPos->id)
            ->get()
            ->each(function (OfferPosRawDimension $rawDimension) use ($offerPosId) {
                $oldRawDimensionId = $rawDimension->id;
                $rawDimension->id = null;
                $rawDimension->offer_pos_id = $offerPosId;
                $newRawDimension = OfferPosRawDimension::create($rawDimension->toArray());
                $this->rawDimensionType($oldRawDimensionId, $newRawDimension);
                $this->rawDimensionShaftUpsetPart($oldRawDimensionId, $newRawDimension);
                $this->OfferPosDimensionUpsetPartForgedBeam($oldRawDimensionId, $newRawDimension);
            });

    }

    protected function mechanicalProcesses($sourceOfferPos, $offerPosId): void
    {
        OfferPosMechanicalProcess::where('offer_pos_id', $offerPosId)
            ->delete();
        OfferPosMechanicalProcess::where('offer_pos_id', $sourceOfferPos->id)
            ->get()
            ->each(function ($mechanicalProcess) use ($offerPosId) {
                $mechanicalProcess->id = null;
                $mechanicalProcess->offer_pos_id = $offerPosId;
                OfferPosMechanicalProcess::create($mechanicalProcess->toArray());

            });
    }

    /**
     * @param $oldRawDimensionId
     * @param $newRawDimension
     * @return void
     */
    protected function rawDimensionType($oldRawDimensionId, $newRawDimension): void
    {
        RawDimensionType::where('offer_pos_raw_dimensions_id', $oldRawDimensionId)
            ->get()
            ->each(function (RawDimensionType $rawDimensionType) use ($newRawDimension) {
                $rawDimensionType->id = null;
                $rawDimensionType->offer_pos_raw_dimensions_id = $newRawDimension->id;
                RawDimensionType::create($rawDimensionType->toArray());
            });
    }

    /**
     * @param $oldRawDimensionId
     * @param $newRawDimension
     * @return void
     */
    protected function rawDimensionShaftUpsetPart($oldRawDimensionId, $newRawDimension): void
    {
        OfferPosDimensionShaftUpsetPart::where('offer_pos_raw_dimension_id', $oldRawDimensionId)
            ->get()
            ->each(function (OfferPosDimensionShaftUpsetPart $rawDimension) use ($newRawDimension) {
                $rawDimension->id = null;
                $rawDimension->offer_pos_raw_dimension_id = $newRawDimension->id;
                OfferPosDimensionShaftUpsetPart::create($rawDimension->toArray());
            });
    }

    /**
     * @param $oldRawDimensionId
     * @param $newRawDimension
     * @return void
     */
    protected function offerPosDimensionUpsetPartForgedBeam($oldRawDimensionId, $newRawDimension): void
    {
        OfferPosDimensionUpsetPartForgedBeam::where('offer_pos_raw_dimension_id', $oldRawDimensionId)
            ->get()
            ->each(function (OfferPosDimensionUpsetPartForgedBeam $rawDimension) use ($newRawDimension) {
                $rawDimension->id = null;
                $rawDimension->offer_pos_raw_dimension_id = $newRawDimension->id;
                OfferPosDimensionUpsetPartForgedBeam::create($rawDimension->toArray());
            });
    }

    /**
     * @param $sourceOfferPos
     * @param $newOfferPosId
     * @return void
     * @throws Exception
     */
    protected function copyCalculations($sourceOfferPos, $newOfferPosId, Request $request): void
    {
        #find source calculation
        $sourceCalculation = Calculation::where('offer_pos_id', $sourceOfferPos->id)->first();
        $calculation = Calculation::with('prodOrderPos:id,calculation_id')->where('offer_pos_id', $newOfferPosId)->first();

        $oldCalculation = $calculation?->toArray();
        #delete Calculation

        if ($sourceCalculation) {
            #create OperationPlan
            $operationPlan = OperationPlan::create([
                'custom_id' => IdGeneratorController::generateId('OperationPlan')
            ]);
            #create OperationPlanPOs
            $this->copyOperationPlanPos($sourceCalculation, $operationPlan);

            $sourceCalculationId = $sourceCalculation->id;
            $sourceCalculation->offer_pos_id = $newOfferPosId;
            $sourceCalculation->id = null;

            $sourceCalculation->operation_plan_id = $operationPlan->id;
            if (!$request->exceptAssessment) {
                $calculation?->delete();
                $newCalculation = $sourceCalculation->replicate(['id', 'sales_order', 'sales_order_pos','price','delivery_interval']); // Avoid copying id and calculation_id
                $newCalculation->sales_order = $oldCalculation['sales_order']?? null;
                $newCalculation->sales_order_pos = $oldCalculation['sales_order_pos']??null;
                $newCalculation->save();

                if (!empty($oldCalculation['prod_order_pos'])) {
                    $ids = collect($oldCalculation['prod_order_pos'])->pluck('id');
                    if ($ids->isNotEmpty()) {
                        ProdOrderPos::whereIn('id', $ids)->update(['calculation_id' => $newCalculation['id']]);
                    }
                }

                #create  CalculationHeatTreatment
                $this->calculationHeatTreatment($sourceCalculationId, $newCalculation);
                $this->calculationDeformation($sourceCalculationId, $newCalculation);
                $this->calculationMaterialAnalysis($sourceCalculationId, $newCalculation);
                $this->calculationHardenabilityRange($sourceCalculationId, $newCalculation);
                $this->calculationDocumentation($sourceCalculationId, $newCalculation);
                $this->calculationMetalography($sourceCalculationId, $newCalculation);
                $this->calculationTestingScope($sourceCalculationId, $newCalculation);
                $this->calculationNonDestructiveTesting($sourceCalculationId, $newCalculation);
                $this->calculationResidualMaterial($sourceCalculationId, $newCalculation);
            } else {
                $excludedFields = ['id', 'documentation_id', 'metallography_id', 'testing_scope_id', 'non_destructive_testing_id', 'specification_id', 'hardenability_range_id', 'deformation_id', 'hwe_work_plan_id', 'material_analysis_id', 'residual_material_id', 'sales_order_pos','price','delivery_interval'];
                foreach ($sourceCalculation->getAttributes() as $key => $value) {
                    if (!in_array($key, $excludedFields)) {
                        $calculation->$key = $value; // Update the field
                    }
                }

                $calculation->operation_plan_id = $operationPlan->id;
                $calculation->save();
                $this->calculationHeatTreatment($sourceCalculationId, $calculation);
            }

        }

    }

    protected function calculationHardenabilityRange($sourceCalculationId, $newCalculation)
    {
        $data = CalculationHardenabilityRange::with('materials')->where('calculation_id', $sourceCalculationId)->first();
        if($data) {
            $hardenAbilityRange = $data->replicate(['id', 'calculation_id']);
            $hardenAbilityRange->calculation_id = $newCalculation->id;
            $hardenAbilityRange->id = null;
            $hardenAbilityRange->save();

            if ($data->materials->isNotEmpty()) {
                $hardenAbilityRange->materials()->sync($data->materials->pluck('id')->toArray());
            }
        }
    }

    protected function calculationDeformation($sourceCalculationId, $newCalculation)
    {
        $data = CalculationDeformation::where('calculation_id', $sourceCalculationId)->first();
        if ($data) {
            $data->calculation_id = $newCalculation->id;
            $data->id = null;
            CalculationDeformation::create( $data->toArray());
        }
    }

    protected function calculationMaterialAnalysis($sourceCalculationId, $newCalculation)
    {
        $data = CalculationMaterialAnalysis::with('materials','chemAnalyses')->where('calculation_id', $sourceCalculationId)->first();
        if($data) {
            $materialAnalysis = $data->replicate(['id', 'calculation_id']);
            $materialAnalysis->calculation_id = $newCalculation->id;
            $materialAnalysis->id = null;
            $materialAnalysis->save();
            foreach ($data->chemAnalyses??[] as $analysisData) {
                $analysisArray = $analysisData->toArray();
                unset($analysisArray['id']);
                $materialAnalysis->chemAnalyses()->create($analysisArray);
            }

            if ($data->materials->isNotEmpty()) {
                $materialAnalysis->materials()->sync($data->materials->pluck('id')->toArray());
            } 
        }
    }

    protected function calculationDocumentation($sourceCalculationId, $newCalculation)
    {
        $data = CalculationDocumentation::with('certificates')->where('calculation_id', $sourceCalculationId)->first();

        if ($data) {
            $documentation = $data->replicate(['id', 'calculation_id']); // Avoid copying id and calculation_id
            $documentation->calculation_id = $newCalculation->id;
            $documentation->save();
            $data->certificates->each(function ($certificate) use ($documentation) {
                $documentation->certificates()->create([
                    'certificate' => $certificate->certificate,
                ]);
            });
        }
    }

    protected function calculationMetalography($sourceCalculationId, $newCalculation)
    {
        $data = CalculationMetallography::with('cleanlinessDeterminationAccordingTo')->where('calculation_id', $sourceCalculationId)->first();
        if ($data) {
            $calM = $data->replicate(['id', 'calculation_id']); // Avoid copying id and calculation_id
            $calM->calculation_id = $newCalculation->id;
            $calM->save();
            $data->cleanlinessDeterminationAccordingTo->each(function ($cleanliness) use ($calM) {
                Log::error(json_encode( $cleanliness));
                $calM->cleanlinessDeterminationAccordingTo()->create([
                    'cleanliness_determination_according_to' => $cleanliness->cleanliness_determination_according_to,
                ]);
            });
        }
    }

    protected function calculationTestingScope($sourceCalculationId, $newCalculation)
    {
        $data = CalculationTestingScope::with('attestationEntities', 'accordingToTensileTests', 'accordingToImpactTests', 'meltingTypes', 'classifiedBies')
            ->where('calculation_id', $sourceCalculationId)->first();
        if ($data) {
            $testingScope = $data->replicate(['id', 'calculation_id']); // Avoid copying id and calculation_id
            $testingScope->calculation_id = $newCalculation->id;
            $testingScope->save();
            $data->attestationEntities->each(function ($attestationEntity) use ($testingScope) {
                $testingScope->attestationEntities()->create([
                    'attestation_entity' => $attestationEntity->attestation_entity,
                ]);
            });

            $data->accordingToTensileTests->each(function ($accordingToTensileTest) use ($testingScope) {
                $testingScope->accordingToTensileTests()->create([
                    'according_to_tensile_test' => $accordingToTensileTest->according_to_tensile_test,
                ]);
            });

            $data->accordingToImpactTests->each(function ($accordingToImpactTest) use ($testingScope) {
                $testingScope->accordingToImpactTests()->create([
                    'according_to_impact_test' => $accordingToImpactTest->according_to_impact_test,
                ]);
            });

            $data->meltingTypes->each(function ($meltingType) use ($testingScope) {
                $testingScope->meltingTypes()->create([
                    'melting_type' => $meltingType->melting_type,
                ]);
            });

            $data->classifiedBies->each(function ($classifiedBy) use ($testingScope) {
                $testingScope->classifiedBies()->create([
                    'classified_by' => $classifiedBy->classified_by,
                ]);
            });
            $data->sampleDepths->each(function ($sampleDepth) use ($testingScope) {
                $testingScope->sampleDepths()->create([
                    'sample_depth' => $sampleDepth->sample_depth,
                ]);
            });
        }
    }

    protected function calculationNonDestructiveTesting($sourceCalculationId, $newCalculation)
    {
        $data = CalculationNonDestructiveTesting::with('attestationEntities', 'nonDestructiveNorm')->where('calculation_id', $sourceCalculationId)->first();
        if ($data) {
            $nonDestructiveTesting = $data->replicate(['id', 'calculation_id']); // Avoid copying id and calculation_id
            $nonDestructiveTesting->calculation_id = $newCalculation->id;
            $nonDestructiveTesting->save();
            $data->attestationEntities->each(function ($attestationEntity) use ($nonDestructiveTesting) {
                $nonDestructiveTesting->attestationEntities()->create([
                    'attestation_entity' => $attestationEntity->attestation_entity,
                ]);
            });

            if($data->nonDestructiveNorm){
                $normType = $this->getNormType($data->surface_crack_test_method);
                $nonDestructiveTesting->nonDestructiveNorm()->create([
                    'norm_type'=>$normType,
                    'norm_id'=>$data->nonDestructiveNorm->norm_id,
                ]);
            }

        }
    }

    protected function getNormType($type): string
    {
        return [
            'PT' => PtNorm::class,
            'VT' => VtNorm::class,
            'MT' => MtNorm::class
        ][$type];
    }

    protected function calculationResidualMaterial($sourceCalculationId, $newCalculation)
    {
        $data = CalculationResidualMaterial::where('calculation_id', $sourceCalculationId)->first();
        if ($data) {
            $data->calculation_id = $newCalculation->id;
            $data->id = null;
            CalculationResidualMaterial::create($data->toArray());
        }
    }

    /**
     * * delete previous OperationPlanPos and copy existing OperationPlanPos
     * @param $sourceCalculation
     * @param $operationPlan
     * @return void
     */
    protected function copyOperationPlanPos($sourceCalculation, $operationPlan): void
    {
        OperationPlanPos::where('operation_plan_id', $sourceCalculation->operation_plan_id)
            ->get()
            ->each(function (OperationPlanPos $opPos) use ($operationPlan) {
                $id = $opPos->id;
                $opPos->id = null;
                $opPos->operation_plan_id = $operationPlan->id;
                $newPlan = OperationPlanPos::create($opPos->toArray());
                $this->copyOperationPlanPosMedia($newPlan, $id);
                $this->copyOperationPlanPosHeatTreatments($newPlan, $id);
            });
    }

    public function copyOperationPlanPosMedia($newPlan, $opPos)
    {
        Media::where('model_type', OperationPlanPos::class)->where('model_id', $newPlan->id)->delete();
        Media::where('model_type', OperationPlanPos::class)
            ->where('model_id', $opPos)
            ->get()->each(function ($media) use ($newPlan) {
                $new = $media->replicate(['id', 'model_id']);
                $new->model_id = $newPlan->id;
                $new->uuid = Str::uuid();
                $new->save();
                $this->copyMediaData($media, $new);

            });
    }

    public function copyMediaData($media, $new)
    {
        $sourceDirectory = "$media->id";
        $destinationDirectory = "$new->id";
        $files = Storage::disk('public')->files($sourceDirectory);
        foreach ($files as $file) {
            $filename = basename($file);
            $destinationPath = $destinationDirectory . '/' . $filename;
            Storage::disk('public')->copy($file, $destinationPath);
        }
    }

    public function copyOperationPlanPosHeatTreatments($newPlan, $opPos)
    {
        OperationPlanPosHeatTreatment::where('operation_plan_pos_id', $newPlan->id)->delete();
        OperationPlanPosHeatTreatment::where('operation_plan_pos_id', $opPos)
            ->get()->each(function ($data) use ($newPlan) {
                $new = $data->replicate(['id', 'model_id']);
                $new->operation_plan_pos_id = $newPlan->id;
                $new->save();
            });
    }

    /**
     * delete previous CalculationHeatTreatment and copy existing CalculationHeatTreatment
     * @param $sourceCalculationId
     * @param $newCalculation
     * @return void
     */
    protected function calculationHeatTreatment($sourceCalculationId, $newCalculation): void
    {
        CalculationHeatTreatment::where('calculation_id', $newCalculation->id)->delete();

        CalculationHeatTreatment::where('calculation_id', $sourceCalculationId)
            ->get()
            ->each(function (CalculationHeatTreatment $calHeatTr) use ($newCalculation) {
                $calHeatTr->id = null;
                $calHeatTr->calculation_id = $newCalculation->id;
                CalculationHeatTreatment::create($calHeatTr->toArray());
            });
        CalculationAdditionalHeatTreatment::where('calculation_id',  $newCalculation->id)->delete();

        CalculationAdditionalHeatTreatment::where('calculation_id', $sourceCalculationId)
            ->get()
            ->each(function (CalculationAdditionalHeatTreatment $calHeatTr) use ($newCalculation) {
                $calHeatTr->id = null;
                $calHeatTr->calculation_id = $newCalculation->id;
                CalculationAdditionalHeatTreatment::create($calHeatTr->toArray());
            });
    }

    public function generateSummaryPDF($id, $lang, $isDownloadAllPos = false)
    {
        app()->setLocale($lang);
        session()->put('locale', $lang);
        $pdfFiles = [];
        $relations = ['offer.customer.country', 'calculation.chemAnalyses', 'calculation.materialAnalysis', 'calculation.calculationMaterialAnalysis', 'calculation.additionalHeatTreatments', 'calculation.heatTreatments', 'calculation.nonDestructiveTesting.usNorm', 'calculation.nonDestructiveTesting.nonDestructiveNorm.norm', 'calculation.calculationNonDestructiveTesting.usNorm', 'calculation.calculationNonDestructiveTesting.nonDestructiveNorm.norm', 'calculation.deformation', 'calculation.calculationDeformation', 'calculation.specification', 'calculation.documentation', 'calculation.calculationDocumentation', 'calculation.metallography', 'calculation.calculationMetallography', 'calculation.testingScope.attestationEntities', 'calculation.testingScope.meltingTypes', 'calculation.testingScope.classifiedBies', 'calculation.calculationTestingScope.attestationEntities', 'calculation.calculationTestingScope.meltingTypes', 'calculation.calculationTestingScope.classifiedBies', 'calculation.residualMaterial', 'calculation.calculationResidualMaterial', 'calculation.hardenabilityRange', 'calculation.calculationHardenabilityRange', 'material', 'item', 'offerPosCosts'];
        $offerCustomId = '';
        try {
            OfferPos::when($isDownloadAllPos, function ($q) use ($id) {
                return $q->where('offer_id', $id);
            })->when(!$isDownloadAllPos, function ($q) use ($id) {
                return $q->where('id', $id);
            })
                ->with($relations)->get()
                ->map(function ($offerPos) use ($lang, &$pdfFiles,$isDownloadAllPos,&$offerCustomId) {
                    $offerCustomId = $offerPos?->offer?->custom_id;
                    $pdfFiles[] = $this->loadPdf($offerPos, $lang,$isDownloadAllPos);
                });
      
         return $isDownloadAllPos
                ? $this->generateZipFile($pdfFiles, $offerCustomId)
                :  response()->json(['pdfFile' => $pdfFiles[0]]);

        } catch (\Throwable $th) {
            Log::error($th);
            return $th;
        }
    }

    public function generateZipFile($filesToStream,$offer)
    {
       
        $zipFileName = $offer . '.zip';
        $zipFilePath = storage_path('app/public/hwe-qs/certificate/' . $zipFileName);
        $zip = new ZipArchive();

        if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {

            foreach ($filesToStream as $file) {
                $array = explode('/', $file);
                
                $lastValue = end($array);
                
                $pdfFilePath = "hwe-qs/certificate/$lastValue";
                
                if (Storage::disk(name: 'public')->exists($pdfFilePath)) {
                    $zip->addFile(Storage::disk(name: 'public')->path($pdfFilePath), basename($file));
                } else {
                    return response()->json(['message' => "PDF file $lastValue does not exist."], 404);
                }
            }
            $zip->close();
            $path = env('APP_URL', 'http://localhost') . "/storage/hwe-qs/certificate/$zipFileName" ?? '';
          
            return response()->json(compact('path'));
        } else {
            return response()->json(['message' => 'Failed to create ZIP file.'], 500);
        }
    }


    protected function loadPdf($offerpos, $lang,$isDownloadAllPos)
    {
        $data = [];
        $filename = $offerpos->offer->custom_id . '-' . $offerpos->pos . '-' . now()->format('Y_m_d') . '.pdf';
        $data['offerPos'] = $offerpos->toArray();

        $data['offerPos']['calculation']['standard_material_analysis'] = $data['offerPos']['calculation']['material_analysis'];
        $data['offerPos']['calculation']['standard_non_destructive_testing'] = $data['offerPos']['calculation']['non_destructive_testing'];
        // $data['offerPos']['calculation']['standard_deformation'] = $data['offerPos']['calculation']['deformation'];
        // $data['offerPos']['calculation']['deformation'] = $data['offerPos']['calculation']['deformation'];
        $data['offerPos']['calculation']['standard_documentation'] = $data['offerPos']['calculation']['documentation'];
        $data['offerPos']['calculation']['standard_metallography'] = $data['offerPos']['calculation']['metallography'];
        $data['offerPos']['calculation']['standard_testing_scope'] = $data['offerPos']['calculation']['testing_scope'];
        $data['offerPos']['calculation']['standard_residual_material'] = $data['offerPos']['calculation']['residual_material'];
        $data['offerPos']['calculation']['standard_hardenability_range'] = $data['offerPos']['calculation']['hardenability_range'];

        // $data['offerPos']['calculation']['material_analysis'] = $data['offerPos']['calculation']['chem_analyses'];
        $data['offerPos']['calculation']['material_analysis'] = $data['offerPos']['calculation']['standard_material_analysis'] ? $data['offerPos']['calculation']['calculation_material_analysis'] : [];
        $data['offerPos']['calculation']['non_destructive_testing'] = $data['offerPos']['calculation']['standard_non_destructive_testing'] ? $data['offerPos']['calculation']['calculation_non_destructive_testing'] : [];
        // $data['offerPos']['calculation']['deformation'] = $data['offerPos']['calculation']['calculation_deformation'];
        $data['offerPos']['calculation']['documentation'] = $data['offerPos']['calculation']['standard_documentation'] ? $data['offerPos']['calculation']['calculation_documentation'] : [];
        $data['offerPos']['calculation']['metallography'] = $data['offerPos']['calculation']['standard_metallography'] ? $data['offerPos']['calculation']['calculation_metallography'] : [];
        $data['offerPos']['calculation']['testing_scope'] = $data['offerPos']['calculation']['standard_testing_scope'] ? $data['offerPos']['calculation']['calculation_testing_scope'] : [];
        $data['offerPos']['calculation']['residual_material'] = $data['offerPos']['calculation']['standard_residual_material'] ? $data['offerPos']['calculation']['calculation_residual_material'] : [];
        $data['offerPos']['calculation']['hardenability_range'] = $data['offerPos']['calculation']['standard_hardenability_range'] ? $data['offerPos']['calculation']['calculation_hardenability_range'] : [];

        $data['offerPos']['calculation']['heat_treatment_types'] = '';
        if ($data['offerPos']['calculation']['heat_treatments'] && sizeof($data['offerPos']['calculation']['heat_treatments']) > 0) {
            $heat = $data['offerPos']['calculation']['heat_treatments'];
            for ($i = 0; $i < sizeof($heat); $i++) {
                if ($heat[$i]['type'] !== '') {
                    if ($data['offerPos']['calculation']['heat_treatment_types'] == '') {
                        $data['offerPos']['calculation']['heat_treatment_types'] = trans('messages.hwekalkOfferSummary.enums.' . $heat[$i]['type']);
                    } else {
                        $data['offerPos']['calculation']['heat_treatment_types'] .= ',' . (trans('messages.hwekalkOfferSummary.enums.' . $heat[$i]['type']));
                    }
                }
            }
        }

        $data['offerPos']['calculation']['notes'] = $offerpos->generateText4();
        $data['offerPos']['calculation']['additional_heat_treatment_types'] = '';
        if ($data['offerPos']['calculation']['additional_heat_treatments'] && sizeof($data['offerPos']['calculation']['additional_heat_treatments']) > 0) {
            $heat = $data['offerPos']['calculation']['additional_heat_treatments'];
            for ($i = 0; $i < sizeof($heat); $i++) {
                if ($heat[$i]['type'] !== '') {
                    if ($data['offerPos']['calculation']['additional_heat_treatment_types'] == '') {
                        $data['offerPos']['calculation']['additional_heat_treatment_types'] = trans('messages.hwekalkOfferSummary.enums.' . $heat[$i]['type']);
                    } else {
                        $data['offerPos']['calculation']['additional_heat_treatment_types'] .= ',' . (trans('messages.hwekalkOfferSummary.enums.' . $heat[$i]['type']));
                    }
                }
            }
        }

        if ($data['offerPos']['calculation']['testing_scope'] && isset($data['offerPos']['calculation']['testing_scope']['attestation_entities']) && sizeof($data['offerPos']['calculation']['testing_scope']['attestation_entities']) > 0) {
            $data['offerPos']['calculation']['testing_scope']['attestation_entities_array'] = '';
            $attestian = $data['offerPos']['calculation']['testing_scope']['attestation_entities'];
            for ($i = 0; $i < sizeof($attestian); $i++) {
                if ($attestian[$i]['attestation_entity'] !== '') {
                    if ($data['offerPos']['calculation']['testing_scope']['attestation_entities_array'] == '') {
                        $data['offerPos']['calculation']['testing_scope']['attestation_entities_array'] = trans('messages.attestationEntity.' . $attestian[$i]['attestation_entity']);
                    } else {
                        $data['offerPos']['calculation']['testing_scope']['attestation_entities_array'] .= ',' . (trans('messages.attestationEntity.' . $attestian[$i]['attestation_entity']));
                    }
                }
            }
        }

        if ($data['offerPos']['calculation']['testing_scope'] && isset($data['offerPos']['calculation']['testing_scope']['melting_types']) && sizeof($data['offerPos']['calculation']['testing_scope']['melting_types']) > 0) {
            $data['offerPos']['calculation']['testing_scope']['melting_type_array'] = '';
            $melt = $data['offerPos']['calculation']['testing_scope']['melting_types'];
            for ($i = 0; $i < sizeof($melt); $i++) {
                if ($melt[$i]['melting_type'] !== '') {
                    if ($data['offerPos']['calculation']['testing_scope']['melting_type_array'] == '') {
                        if ($melt[$i]['melting_type'] == MaterialAnalysisMeltingType::VACUUM_DEGASSING()) {
                            $data['offerPos']['calculation']['testing_scope']['melting_type_array'] = __('messages.special.VACUUM_DEGASSING');
                        } else {
                            $data['offerPos']['calculation']['testing_scope']['melting_type_array'] = __('messages.meltingTypes.' . $melt[$i]['melting_type']);
                        }
                    } else {
                        if ($melt[$i]['melting_type'] == MaterialAnalysisMeltingType::VACUUM_DEGASSING()) {
                            $data['offerPos']['calculation']['testing_scope']['melting_type_array'] .= ',' . __('messages.special.VACUUM_DEGASSING');
                        } else {
                            $data['offerPos']['calculation']['testing_scope']['melting_type_array'] .= ',' . (__('messages.meltingTypes.' . $melt[$i]['melting_type']));
                        }
                    }
                }
            }
        }

        if ($data['offerPos']['calculation']['testing_scope'] && isset($data['offerPos']['calculation']['testing_scope']['classified_bies']) && sizeof($data['offerPos']['calculation']['testing_scope']['classified_bies']) > 0) {
            $data['offerPos']['calculation']['testing_scope']['classified_bies_array'] = '';
            $bias = $data['offerPos']['calculation']['testing_scope']['classified_bies'];
            for ($i = 0; $i < sizeof($bias); $i++) {
                if ($bias[$i]['classified_by'] !== '') {
                    if ($data['offerPos']['calculation']['testing_scope']['classified_bies_array'] == '') {
                        $data['offerPos']['calculation']['testing_scope']['classified_bies_array'] = trans('messages.attestationEntity.' . $bias[$i]['classified_by']);
                    } else {
                        $data['offerPos']['calculation']['testing_scope']['classified_bies_array'] .= ',' . (trans('messages.attestationEntity.' . $bias[$i]['classified_by']));
                    }
                }
            }
        }

        /** Offer Pos Costs */
        $data['offerPos']['groupByCosts'] = $offerpos->getCostGroupByData($data['offerPos']['offer_pos_costs']);
        $data['offerPos']['cost_lead_days_sum'] = 0;
        if ($data['offerPos']['offer_pos_costs'] && sizeof($data['offerPos']['offer_pos_costs']) > 0) {
            for ($i = 0; $i < sizeof($data['offerPos']['offer_pos_costs']); $i++) {
                $data['offerPos']['cost_lead_days_sum'] += $data['offerPos']['offer_pos_costs'][$i]['lead_time_days'];
            }
        }

        $data['offerPos']['text_certificate'] = $offerpos->getTextCertification();
        $data['offerPos']['outer_dim_cut_allow'] = '';
        $data['offerPos']['outer_dim_tol'] = '';
        $data['offerPos']['outer_dim_surface'] = '';

        switch ($data['offerPos']['product_type']) {
            case OfferPosProductType::DISK():
            case OfferPosProductType::DISK_PUNCHED():
            case OfferPosProductType::RING_CYLINDER():
            case OfferPosProductType::RING_ROLLED():
            case OfferPosProductType::BAR_ROLLED():
            case OfferPosProductType::PIPE():
            case OfferPosProductType::SOCKET():
            case OfferPosProductType::BAR_ROUND():
            case OfferPosProductType::SHAFT():
            case OfferPosProductType::UPSET_PART():
            case OfferPosProductType::SHAFT_HOLLOW():
                $data['offerPos']['outer_dim_cut_allow'] = $data['offerPos']['min_allowance_outer_diameter_final'] != null ? $data['offerPos']['min_allowance_outer_diameter_final'] : '';
                $data['offerPos']['outer_dim_cut_allow'] = $data['offerPos']['outer_dim_cut_allow'] != '' && $data['offerPos']['max_allowance_outer_diameter_final'] != null ?
                    $data['offerPos']['outer_dim_cut_allow'] . ' - ' . $data['offerPos']['max_allowance_outer_diameter_final'] :
                    $data['offerPos']['outer_dim_cut_allow'] . $data['offerPos']['max_allowance_outer_diameter_final'];
                $data['offerPos']['outer_dim_tol'] = $data['offerPos']['outer_tolerance'] ? trans('messages.hwekalkOfferSummary.enums.' . $data['offerPos']['outer_tolerance']) : '';
                $data['offerPos']['outer_dim_surface'] = $data['offerPos']['outer_diameter_surface_final'] ? trans('messages.hwekalkOfferSummary.enums.' . $data['offerPos']['outer_diameter_surface_final']) : '';
                break;
            case OfferPosProductType::BAR_SQUARE():
                $data['offerPos']['outer_dim_cut_allow'] = $data['offerPos']['min_allowance_side_a_final'] != null ? $data['offerPos']['min_allowance_side_a_final'] : '';
                $data['offerPos']['outer_dim_cut_allow'] = $data['offerPos']['outer_dim_cut_allow'] != '' && $data['offerPos']['max_allowance_side_a_final'] != null ?
                    $data['offerPos']['outer_dim_cut_allow'] . ' - ' . $data['offerPos']['max_allowance_side_a_final'] :
                    $data['offerPos']['outer_dim_cut_allow'] . $data['offerPos']['max_allowance_side_a_final'];

                $data['offerPos']['outer_dim_tol'] = $data['offerPos']['side_a_tolerance'] ? trans('messages.hwekalkOfferSummary.enums.' . $data['offerPos']['side_a_tolerance']) : '';
                $data['offerPos']['outer_dim_surface'] = $data['offerPos']['side_a_surface_final'] ? trans('messages.hwekalkOfferSummary.enums.' . $data['offerPos']['side_a_surface_final']) : '';
                break;
            default:
                break;
        }

        $data['offerPos']['calculation']['strength_span'] = '';
        $data['offerPos']['calculation']['hardness'] = '';
        $checkAssessment = ($data['offerPos']['calculation']['specification'] != null && $data['offerPos']['calculation']['specification'] != []) ||
            ($data['offerPos']['calculation']['documentation'] != null && $data['offerPos']['calculation']['documentation'] != []) ||
            ($data['offerPos']['calculation']['metallography'] != null && $data['offerPos']['calculation']['metallography'] != []) ||
            ($data['offerPos']['calculation']['testing_scope'] != null && $data['offerPos']['calculation']['testing_scope'] != []) ||
            ($data['offerPos']['calculation']['non_destructive_testing'] != null && $data['offerPos']['calculation']['non_destructive_testing'] != []) ||
            ($data['offerPos']['calculation']['hardenability_range'] != null && $data['offerPos']['calculation']['hardenability_range'] != []) ||
            ($data['offerPos']['calculation']['residual_material'] != null && $data['offerPos']['calculation']['residual_material'] != []) ||
            ($data['offerPos']['calculation']['deformation'] != null && $data['offerPos']['calculation']['deformation'] != []);

        if ($checkAssessment) {
            if ($data['offerPos']['calculation']['testing_scope'] && $data['offerPos']['calculation']['calculation_testing_scope']) {
                $data['offerPos']['calculation']['strength_span'] = $data['offerPos']['calculation']['calculation_testing_scope']['rm_min'] ? $data['offerPos']['calculation']['calculation_testing_scope']['rm_min'] : '';
                $data['offerPos']['calculation']['strength_span'] = $data['offerPos']['calculation']['strength_span'] != '' && $data['offerPos']['calculation']['calculation_testing_scope']['rm'] ?
                    $data['offerPos']['calculation']['strength_span'] . ' - ' . $data['offerPos']['calculation']['calculation_testing_scope']['rm'] :
                    $data['offerPos']['calculation']['strength_span'] . $data['offerPos']['calculation']['calculation_testing_scope']['rm'];

                $data['offerPos']['calculation']['hardness'] = $data['offerPos']['calculation']['calculation_testing_scope']['min_hbw_on_the_component'] ? $data['offerPos']['calculation']['calculation_testing_scope']['min_hbw_on_the_component'] : '';
                $data['offerPos']['calculation']['hardness'] = $data['offerPos']['calculation']['hardness'] != '' && $data['offerPos']['calculation']['calculation_testing_scope']['max_hbw_on_the_component'] ?
                    $data['offerPos']['calculation']['hardness'] . ' - ' . $data['offerPos']['calculation']['calculation_testing_scope']['max_hbw_on_the_component'] :
                    $data['offerPos']['calculation']['hardness'] . $data['offerPos']['calculation']['calculation_testing_scope']['max_hbw_on_the_component'];
            }
        } else {
            $data['offerPos']['calculation']['strength_span'] = $data['offerPos']['calculation']['strength_span_min'] ? $data['offerPos']['calculation']['strength_span_min'] : '';
            $data['offerPos']['calculation']['strength_span'] = $data['offerPos']['calculation']['strength_span'] != '' && $data['offerPos']['calculation']['strength_span_max'] ?
                $data['offerPos']['calculation']['strength_span'] . ' - ' . $data['offerPos']['calculation']['strength_span_max'] :
                $data['offerPos']['calculation']['strength_span'] . $data['offerPos']['calculation']['strength_span_max'];

            $data['offerPos']['calculation']['hardness'] = $data['offerPos']['calculation']['min_hardness'] ? $data['offerPos']['calculation']['min_hardness'] : '';
            $data['offerPos']['calculation']['hardness'] = $data['offerPos']['calculation']['hardness'] != '' && $data['offerPos']['calculation']['max_hardness'] ?
                $data['offerPos']['calculation']['hardness'] . ' - ' . $data['offerPos']['calculation']['max_hardness'] : $data['offerPos']['calculation']['hardness'] . $data['offerPos']['calculation']['max_hardness'];
        }

        $localeID = '';
        $timeZone = '';
        if ($lang == 'en') {
            $localeID = 'en-EN';
            $timeZone = 'America/New_York';
        } elseif ($lang == 'de') {
            $localeID = 'de_DE';
            $timeZone = 'Europe/Berlin';
        } elseif ($lang == 'it') {
            $localeID = 'it_IT';
            $timeZone = 'Europe/Rome';
        } elseif ($lang == 'tr') {
            $localeID = 'tr_TR';
            $timeZone = 'Europe/Istanbul';
        }

        setlocale(LC_TIME, $localeID);
        $timeZone = new DateTimeZone($timeZone);
        $currentDateTime = new DateTime('now', $timeZone);
        $today = $currentDateTime->format('d.m.Y');
        $current_dateTime = $currentDateTime->format('M d, Y, g:i A');
        setlocale(LC_TIME, $localeID . ".utf8");

        $pageSettings = array(
            'main-details' => 'Offers',
            'hasHeader' => true,
            'showHeaderTitle' => true,
            'applyHeaderBorder' => false,
            'header-title' => trans('messages.hwekalkOfferSummary.mainContent.summary'),
            'header-subTitle' => '',
            'showWaterMark' => true,
            'showScherTechLogo' => false,
            'showClientLogo' => true,
            'clientLogoUrl' => '/images/hwe-logo.jpg',
            'showHeaderTitleTable' => false,
            'isCustomFooter' => false,
            'current_date' => $today,
            'current_time' => $current_dateTime,
            'showFooterImage' => true,
            'showFooterDetails' => false,
            'showSimpleFooter' => true,
            'showPoweredBy' => true,
            'pdfCreatedBy' => '',
            'pdfCheckedBy' => '',
            'pdfReleasedBy' => '',
            'pdfVersion' => 'V 1.0',
            'validity' => $current_dateTime,
            'location' => '',
            'footer_page_text' => trans('messages.pdfDetails.footer.page')
        );

        $pdf = PDF::setPaper('a4', 'portrait');
        $pdf->setOptions([
            'isPhpEnabled' => true,
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
            'isFontSubsettingEnabled' => true,
            'setIsTransparent' => true,
            'fontDir' => storage_path('fonts/'),
            'fontCache' => storage_path('fonts/'),
            'defaultFont' => 'Arial',
            'memory_limit' => '512M',
            'encoding' => 'UTF-8'
        ]);
        
        $pdf->loadView('index', ['pageSettings' => $pageSettings, 'viewData' => $data['offerPos']]);
        $pdfContent = $pdf->output();
     
        App::setLocale(config('app.locale'));
        Storage::disk('public')->put("hwe-qs/certificate/$filename", $pdfContent);
        return  env('APP_URL', 'http://localhost') . "/storage/hwe-qs/certificate/$filename";
    }

    public function getRingCalculation(Request $request)
    {
        try {
            $payload = $request->data;
            $url = env('RING_CALCULATION');

            $response = Http::post($url, $payload);

            return $response->json();
        } catch (\Throwable $th) {
            return response()->json(['error' => 'Request failed', 'message' => $th->getMessage()], 500);
        }
    }
    
}