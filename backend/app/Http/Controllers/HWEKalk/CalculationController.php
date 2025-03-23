<?php

namespace App\Http\Controllers\HWEKALK;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Calculation;
use App\Models\Material;
use App\Models\MaterialAnalysis;
use App\Models\CalculationChemicalAnalysis;
use App\Models\CalculationAdditionalHeatTreatment;
use App\Models\CalculationDocumentation;
use App\Models\CalculationHeatTreatment;
use App\Models\CalculationMetallography;
use App\Models\CalculationNonDestructiveTesting;
use App\Models\CalculationResidualMaterial;
use App\Models\CalculationTestingScope;
use App\Models\CalculationDeformation;
use App\Models\CalculationHardenabilityRange;
use App\Models\CalculationMaterialAnalysis;
use App\Models\CalculationNonDestructiveTestingAttestationEntity;
use App\Models\CalculationNonDestructiveNorm;
use App\Models\UsNorm;
use App\Models\NonDestructiveNorm;
use App\Models\MtNorm;
use App\Models\PtNorm;
use App\Models\VtNorm;

class CalculationController extends Controller
{
    /**
     * @param Request $request
     * @return JsonResponse
     * Update/delete/create calculation related assessment based on request parameter
     */
    public function updateCalculationRelatedAssessments(Request $request)
    {
        $payloads = $request->input('payloads', []);

        $responses = [];
        foreach ($payloads as $payload) {
            $section = $payload['section'] ?? null;
            if ($section) {
                switch ($section) {
                    case 'calculationDeformation':
                        $responses[] = $this->handleCalculationDeformation($payload);
                        break;
                    case 'calculationTestingScope':
                        $responses[] = $this->handleCalculationTestingScope($payload);
                        break;
                    case 'calculationMaterialAnalysis':
                        $responses[] = $this->handleCalculationMaterialAnalysis($payload);
                        break;
                    case 'calculationHardenAbilityRange':
                        $responses[] = $this->handleCalculationHardenAbilityRange($payload);
                        break;
                    case 'calculationResidualMaterial':
                        $responses[] = $this->handleCalculationResidualMaterial($payload);
                        break;
                    case 'calculationNonDestructiveTesting':
                        $responses[] = $this->handleCalculationNonDestructiveTesting($payload);
                        break;
                    case 'calculationMetallography':
                        $responses[] = $this->handleCalculatioMetallography($payload);
                        break;
                    case 'calculationDocumentation':
                        $responses[] = $this->handleCalculatioDocumentation($payload);
                        break;
                    default:
                        $responses[] = [
                            'success' => false,
                            'message' => "Invalid section: $section"
                        ];
                        break;
                }
            } else {
                $responses[] = [
                    'success' => false,
                    'message' => 'Section is missing in payload'
                ];
            }
        }

        return response()->json([
            'success' => true,
            'results' => $responses
        ]);
    }

    public function handleCalculationTestingScope($payload)
    {
        try{
            $requestMethod = $payload['request'];
            switch ($requestMethod) {
                case 'delete' :
                    $deleteAbleId = $payload['data']['deleteAbleId'];
                    if ($deleteAbleId) {
                        $calculationTestingScope = CalculationTestingScope::find($deleteAbleId);
                        if ($calculationTestingScope) {
                            $calculationTestingScope->delete();
                            return ['testing_scope_delete' => true];
                        }
                    } else {
                        return ['testing_scope_delete' => false];
                    }
                case 'patch' :
                case 'post' :
                    $updatedCalculationTestingScope = $payload['data']['testingScopeData'];
                    $calculationTestingScopeId = $updatedCalculationTestingScope['id'];
                    $calculationTestingScope = $requestMethod == 'post' ? new CalculationTestingScope() : CalculationTestingScope::find($calculationTestingScopeId);
                    if ($calculationTestingScope) {
                        $excludedFields = ['id', 'attestationEntities', 'accordingToTensileTests', 'accordingToImpactTests', 'meltingTypes', 'sampleDepths', 'classifiedBies', 'custom_id'];
                        $filteredData = array_diff_key($updatedCalculationTestingScope, array_flip($excludedFields));
                        $calculationTestingScope->fill($filteredData);
                        $calculationTestingScope->save();

                        //According to attestation entities
                        $calculationTestingScope->attestationEntities()->delete();
                        if (!empty($updatedCalculationTestingScope['attestationEntities'])) {
                            foreach ($updatedCalculationTestingScope['attestationEntities'] as $attestationData) {
                                $calculationTestingScope->attestationEntities()->create(['attestation_entity' => $attestationData['value']]);
                            }
                        }

                        //According to tensile tests
                        $calculationTestingScope->accordingToTensileTests()->delete();
                        foreach ($updatedCalculationTestingScope['accordingToTensileTests'] ?? [] as $accordingToTensileTestData) {
                            $calculationTestingScope->accordingToTensileTests()->create(['according_to_tensile_test' => $accordingToTensileTestData['value']]);
                        }

                        //According to Impact test
                        $calculationTestingScope->accordingToImpactTests()->delete();
                        foreach ($updatedCalculationTestingScope['accordingToImpactTests'] ?? [] as $accordingToImpactTestData) {
                            $calculationTestingScope->accordingToImpactTests()->create(['according_to_impact_test' => $accordingToImpactTestData['value']]);
                        }

                        //Melting types
                        $calculationTestingScope->meltingTypes()->delete();
                        foreach ($updatedCalculationTestingScope['meltingTypes'] ?? [] as $meltingTypeData) {
                            $calculationTestingScope->meltingTypes()->create(['melting_type' => $meltingTypeData['value']]);
                        }
                        //classified Bies
                        $calculationTestingScope->classifiedBies()->delete();
                        foreach ($updatedCalculationTestingScope['classifiedBies'] ?? [] as $classifiedBieData) {
                            $calculationTestingScope->classifiedBies()->create(['classified_by' => $classifiedBieData['value']]);
                        }

                        //Sample depth
                        $calculationTestingScope->sampleDepths()->delete();
                        foreach ($updatedCalculationTestingScope['sampleDepths'] ?? [] as $sampleDepthData) {
                            $calculationTestingScope->sampleDepths()->create(['sample_depth' => $sampleDepthData['value']]);
                        }

                        return $requestMethod == 'post' ? ['testing_scope_create' => true] : ['testing_scope_update' => true];
                    } else {
                        return $requestMethod == 'post' ? ['testing_scope_create' => false] : ['testing_scope_update' => false];
                    }
                default:
                    return ['testing_scope' => 'not found'];
            }
        } catch (\Exception $e) {
            Log::error('Error in handleCalculationTestingScope: ' . $e->getMessage());
        }
    }

    public function handleCalculationDeformation($payload)
    {
        try{
            $requestMethod = $payload['request'];
            switch ($requestMethod) {
                case 'delete' :
                    $deleteAbleId = $payload['data']['deleteAbleId'];
                    if ($deleteAbleId) {
                        $calculationDeformation = CalculationDeformation::find($deleteAbleId);
                        if ($calculationDeformation) {
                            $calculationDeformation->delete();
                            return ['deformation_delete' => true];
                        }
                    } else {
                        return ['deformation_delete' => false];
                    }
                case 'patch':
                case  'post':
                    $updatedCalculationDeformation = $payload['data']['deformationData'];
                    $calculationDeformationId = $updatedCalculationDeformation['id'];
                    $calculationDeformation = $requestMethod == 'post' ? new CalculationDeformation() : CalculationDeformation::find($calculationDeformationId);
                    if ($calculationDeformation) {
                        $excludedFields = ['id'];
                        $filteredData = array_diff_key($updatedCalculationDeformation, array_flip($excludedFields));
                        $calculationDeformation->fill($filteredData);
                        $calculationDeformation->save();
                        return $requestMethod == 'post' ? ['deformation_create' => true] : ['deformation_update' => true];
                    } else {
                        return $requestMethod == 'post' ? ['deformation_create' => false] : ['deformation_update' => false];
                    }
                default:
                    return ['deformation' => 'not found'];
            }
        } catch (\Exception $e) {
            Log::error('Error in handleCalculationDeformation: ' . $e->getMessage());
        }
    }

    public function handleCalculationMaterialAnalysis($payload)
    {
        try{
            $requestMethod = $payload['request'];
            switch ($requestMethod) {
                case 'delete' :
                    $deleteAbleId = $payload['data']['deleteAbleId'];
                    if ($deleteAbleId) {
                        $calculationMaterialAnalysis = CalculationMaterialAnalysis::find($deleteAbleId);
                        if ($calculationMaterialAnalysis) {
                            $calculationMaterialAnalysis->delete();
                            return ['material_analysis_delete' => true];
                        }
                    } else {
                        return ['material_analysis_delete' => false];
                    }
                case 'patch' :
                case 'post' :
                    $updatedCalculationMaterialAnalysis = $payload['data']['materialAnalysisData'];
                    $calculationMaterialAnalysisId = $updatedCalculationMaterialAnalysis['id'];
                    $calculationMaterialAnalysis = $requestMethod == 'post' ? new CalculationMaterialAnalysis() : CalculationMaterialAnalysis::find($calculationMaterialAnalysisId);

                    if ($calculationMaterialAnalysis) {
                        $excludedFields = ['id', 'chemAnalyses', 'custom_id', 'materials'];
                        $filteredData = array_diff_key($updatedCalculationMaterialAnalysis, array_flip($excludedFields));             
                        $calculationMaterialAnalysis->fill($filteredData);
                        $calculationMaterialAnalysis->save();

                        $materialIds = [];
                        foreach($updatedCalculationMaterialAnalysis['materials'] as $material) {
                            $materialIds[] = $material['id'];
                        }
                        $calculationMaterialAnalysis->materials()->sync($materialIds);

                        $calculationMaterialAnalysis->chemAnalyses()->delete();
                        foreach ($updatedCalculationMaterialAnalysis['chemAnalyses'] ?? [] as $analysisData) {
                            $calculationMaterialAnalysis->chemAnalyses()->create($analysisData);
                        }
                        return $requestMethod == 'post' ? ['material_analysis_create' => true] : ['material_analysis_update' => true];
                    } else {
                        return $requestMethod == 'post' ? ['material_analysis_create' => false] : ['material_analysis_update' => false];
                    }
                default:
                    return ['material_analysis' => 'not found'];
            }
        } catch (\Exception $e) {
            Log::error('Error in handleCalculationMaterialAnalysis: ' . $e->getMessage());
        }
    }

    public function handleCalculationHardenAbilityRange($payload)
    {
        try{
            $requestMethod = $payload['request'];
            switch ($requestMethod) {
                case 'delete' :
                    $deleteAbleId = $payload['data']['deleteAbleId'];
                    if ($deleteAbleId) {
                        $calculationHardenAbilityRange = CalculationHardenabilityRange::find($deleteAbleId);
                        if ($calculationHardenAbilityRange) {
                            $calculationHardenAbilityRange->delete();
                            return ['hardenability_range_delete' => true];
                        }
                    } else {
                        return ['hardenability_range_delete' => false];
                    }
                case 'patch' :
                case 'post' :
                    $updatedCalculationHardenabilityRange = $payload['data']['hardenAbilityRange'];
                    $calculationHardenabilityRangeId = $updatedCalculationHardenabilityRange['id'];         
                    $calculationHardenabilityRange = $requestMethod == 'post' ? new CalculationHardenabilityRange() : CalculationHardenabilityRange::find($calculationHardenabilityRangeId);            
                    if ($calculationHardenabilityRange) {
                        $excludedFields = ['id', 'materials', 'custom_id'];
                        $materialIds = [];
                        foreach($updatedCalculationHardenabilityRange['materials'] as $material) {
                            $materialIds[] = $material['id'];
                        }
                        
                        $filteredData = array_diff_key($updatedCalculationHardenabilityRange, array_flip($excludedFields));
                        $calculationHardenabilityRange->fill($filteredData);
                        $calculationHardenabilityRange->save();
                       
                        $calculationHardenabilityRange->materials()->sync($materialIds);

                        return $requestMethod == 'post' ? ['hardenabilit_range_create' => true] : ['hardenability_range_update' => true];
                    } else {
                        return $requestMethod == 'post' ? ['hardenabilit_range_create' => false] : ['hardenability_range_update' => false];
                    }
                default:
                    return ['hardenability_range' => 'not found'];
            }
        } catch (\Exception $e) {
            Log::error('Error in handleCalculationHardenAbilityRange: ' . $e->getMessage());
        }
    }

    public function handleCalculationResidualMaterial($payload)
    {
        try{
            $requestMethod = $payload['request'];
            switch ($requestMethod) {
                case 'delete' :
                    $deleteAbleId = $payload['data']['deleteAbleId'];
                    if ($deleteAbleId) {
                        $calculationDeformation = CalculationResidualMaterial::find($deleteAbleId);
                        if ($calculationDeformation) {
                            $calculationDeformation->delete();
                            return ['residual_material_delete' => true];
                        }
                    } else {
                        return ['residual_material_delete' => false];
                    }
                case 'patch' :
                case 'post' :
                    $updatedCalculationResidualMaterial = $payload['data']['residualMaterialData'];
                    $calculationResidualMaterialId = $updatedCalculationResidualMaterial['id'];
                    $calculationResidualMaterial = $requestMethod == 'post' ? new CalculationResidualMaterial() : CalculationResidualMaterial::find($calculationResidualMaterialId);
                    if ($calculationResidualMaterial) {
                        $excludedFields = ['id', 'custom_id'];
                        $filteredData = array_diff_key($updatedCalculationResidualMaterial, array_flip($excludedFields));
                        $calculationResidualMaterial->fill($filteredData);
                        $calculationResidualMaterial->save();
                        return $requestMethod == 'post' ? ['residual_material_create' => true] : ['residual_material_update' => true];
                    } else {
                        return $requestMethod == 'post' ? ['residual_material_create' => false] : ['residual_material_update' => false];
                    }
                default:
                    return ['residual_material' => 'not found'];
            }
        } catch (\Exception $e) {
            Log::error('Error in handleCalculationResidualMaterial: ' . $e->getMessage());
        }
    }

    public function handleCalculationNonDestructiveTesting($payload)
    {
        try{
            $requestMethod = $payload['request'];
            switch ($requestMethod) {
                case 'delete' :
                    $deleteAbleId = $payload['data']['deleteAbleId'];
                    if ($deleteAbleId) {
                        $calculationNonDestructiveTesting = CalculationNonDestructiveTesting::find($deleteAbleId);
                        if ($calculationNonDestructiveTesting) {
                            $calculationNonDestructiveTesting->delete();
                            return ['non_destructive_testing' => true];
                        }
                    } else {
                        return ['non_destructive_testing' => false];
                    }
                case 'patch' :
                case 'post' :
                    $updatedCalculationNonDestructiveTesting = $payload['data']['nonDestructiveTesting'];
                    $calculationNonDestructiveTestingId = $updatedCalculationNonDestructiveTesting['id'];
                    $calculationNonDestructiveTesting = $requestMethod == 'post' ? new CalculationNonDestructiveTesting() : CalculationNonDestructiveTesting::find($calculationNonDestructiveTestingId);
                    if ($calculationNonDestructiveTesting) {
                        $excludedFields = ['id', 'custom_id', 'attestationEntities', 'nonDestructiveNorm', 'usNorm',];
                        // $baseExcludedFields = ['mtNorm', 'vtNorm', 'ptNorm'];

                        if (isset($updatedCalculationNonDestructiveTesting['mtNorm'])) {
                            $excludedFields[] = 'mtNorm';
                        }
                        if (isset($updatedCalculationNonDestructiveTesting['vtNorm'])) {
                            $excludedFields[] = 'vtNorm';
                        }
                        if (isset($updatedCalculationNonDestructiveTesting['ptNorm'])) {
                            $excludedFields[] = 'ptNorm';
                        }

                        $filteredData = array_diff_key($updatedCalculationNonDestructiveTesting, array_flip($excludedFields));

                        $filteredData['us_norm_id'] = $updatedCalculationNonDestructiveTesting['usNorm']['id'] ?? null;

                        $calculationNonDestructiveTesting->fill($filteredData);
                        $calculationNonDestructiveTesting->save();

                        $calculationNonDestructiveTesting->attestationEntities()->delete();
                        foreach ($updatedCalculationNonDestructiveTesting['attestationEntities'] ?? [] as $attestationData) {
                            $calculationNonDestructiveTesting->attestationEntities()->create(['attestation_entity' => $attestationData['value']]);
                        }

                        $calculationNonDestructiveNorm = $calculationNonDestructiveTesting->calculationNonDestructiveNorm;

                        $calculationNonDestructiveNorm?->delete();
                        $normType = $this->getNormType($calculationNonDestructiveTesting->surface_crack_test_method);
                        $normIndex = $this->getNormIndex($calculationNonDestructiveTesting->surface_crack_test_method);
                        $nomId = $updatedCalculationNonDestructiveTesting[$normIndex]['id'] ?? null;
                        if ($normType && $nomId) {
                            $calculationNonDestructiveTesting->calculationNonDestructiveNorm()->create([
                                'norm_type' => $normType,
                                'norm_id' => $nomId,
                            ]);
                        }
                        return $requestMethod == 'post' ? ['non_destructive_testing_create' => true] : ['non_destructive_testing_update' => true];
                    } else {
                        return $requestMethod == 'post' ? ['non_destructive_testing_create' => false] : ['non_destructive_testing_update' => false];
                    }
                default:
                    return ['non_destructive_testing' => 'not found'];
            }
        } catch (\Exception $e) {
            Log::error('Error in handleCalculationNonDestructiveTesting: ' . $e->getMessage());
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

    protected function getNormIndex($type): string
    {
        return [
            'PT' => 'ptNorm',
            'VT' => 'vtNorm',
            'MT' => 'mtNorm'
        ][$type];

    }

    public function handleCalculatioMetallography($payload)
    {
        try{
            $requestMethod = $payload['request'];
            switch ($requestMethod) {
                case 'delete' :
                    $deleteAbleId = $payload['data']['deleteAbleId'];
                    if ($deleteAbleId) {
                        $calculationDeformation = CalculationMetallography::find($deleteAbleId);
                        if ($calculationDeformation) {
                            $calculationDeformation->delete();
                            return ['metallography_delete' => true];
                        }
                    } else {
                        return ['metallography_delete' => false];
                    }
                case 'patch':
                case  'post':
                    $updatedCalculationMetallography = $payload['data']['metallographyData'];
                    $calculationMetallographyId = $updatedCalculationMetallography['id'];
                    $calculationMetallography = $requestMethod == 'post' ? new CalculationMetallography() : CalculationMetallography::find($calculationMetallographyId);
                    if ($calculationMetallography) {
                        $excludedFields = ['id', 'cleanlinessDeterminationAccordingTo', 'custom_id'];
                        $filteredData = array_diff_key($updatedCalculationMetallography, array_flip($excludedFields));
                        $calculationMetallography->fill($filteredData);
                        $calculationMetallography->save();

                        $calculationMetallography->cleanlinessDeterminationAccordingTo()->delete();
                        foreach ($updatedCalculationMetallography['cleanlinessDeterminationAccordingTo'] ?? [] as $metallographyData) {
                            $calculationMetallography->cleanlinessDeterminationAccordingTo()->create(['cleanliness_determination_according_to' => $metallographyData['value']]);
                        }

                        return $requestMethod == 'post' ? ['deformation_create' => true] : ['deformation_update' => true];
                    } else {
                        return $requestMethod == 'post' ? ['deformation_create' => false] : ['deformation_update' => false];
                    }
                default:
                    return ['deformation' => 'not found'];
            }
        } catch (\Exception $e) {
            Log::error('Error in handleCalculatioMetallography: ' . $e->getMessage());
        }
    }

    public function handleCalculatioDocumentation($payload)
    {
        try{
            $requestMethod = $payload['request'];
            switch ($requestMethod) {
                case 'delete' :
                    $deleteAbleId = $payload['data']['deleteAbleId'];
                    if ($deleteAbleId) {
                        $calculationDocumentation = CalculationDocumentation::find($deleteAbleId);
                        if ($calculationDocumentation) {
                            $calculationDocumentation->delete();
                            return ['documentation_delete' => true];
                        }
                    } else {
                        return ['documentation_delete' => false];
                    }
                case 'patch':
                case 'post':
                    $updatedCalculationDocumentation = $payload['data']['documentationData'];
                    $calculationDocumentationId = $updatedCalculationDocumentation['id'];
                    $calculationDocumentation = $requestMethod == 'post' ? new CalculationDocumentation() : CalculationDocumentation::find($calculationDocumentationId);
                    if ($calculationDocumentation) {
                        $excludedFields = ['id', 'certificates', 'custom_id'];
                        $filteredData = array_diff_key($updatedCalculationDocumentation, array_flip($excludedFields));
                        $calculationDocumentation->fill($filteredData);
                        $calculationDocumentation->save();

                        $calculationDocumentation->certificates()->delete();
                        foreach ($updatedCalculationDocumentation['certificates'] ?? [] as $certificateData) {
                            $calculationDocumentation->certificates()->create(['certificate' => $certificateData['value']]);
                        }

                        return $requestMethod == 'post' ? ['documentation_create' => true] : ['documentiaton_update' => true];
                    } else {
                        return $requestMethod == 'post' ? ['documentation_create' => false] : ['documentiaton_update' => false];
                    }
                default:
                    return ['documentation' => 'not found'];
            }
        } catch (\Exception $e) {
            Log::error('Error in handleCalculatioDocumentation: ' . $e->getMessage());
        }
    }
}
