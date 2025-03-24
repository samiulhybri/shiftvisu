<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Calculation extends Model
{
    use HasFactory;
    protected $guarded = [];
    #[LodataRelationship]
    public function operationPlan(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(OperationPlan::class,'operation_plan_id');
    }

    #[LodataRelationship]
    public function offerPos(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(OfferPos::class);
    }

    #[LodataRelationship]
    public function metallography(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Metallography::class);
    }
    
    #[LodataRelationship]
    public function documentation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Documentation::class, 'documentation_id');
    }

    #[LodataRelationship]
    public function testingScope(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(TestingScope::class);
    }

    #[LodataRelationship]
    public function nonDestructiveTesting(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(NonDestructiveTesting::class);
    }
    #[LodataRelationship]
    public function residualMaterial(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ResidualMaterial::class, 'residual_material_id');
    }
    #[LodataRelationship]
    public function specification(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Specification::class);
    }

    #[LodataRelationship]
    public function heatTreatments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->HasMany(CalculationHeatTreatment::class);
    }

    #[LodataRelationship]
    public function heatTreatmentPosTen(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->HasOne(CalculationHeatTreatment::class)->where('pos', '10');
    }

    #[LodataRelationship]
    public function additionalHeatTreatments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->HasMany(CalculationAdditionalHeatTreatment::class);
    }

    #[LodataRelationship]
    public function chemAnalyses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->HasMany(CalculationChemAnalysis::class);
    }
    #[LodataRelationship]
    public function calculationDocumentation(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationDocumentation::class);
    }
    #[LodataRelationship]
    public function calculationResidualMaterial(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationResidualMaterial::class);
    }
    #[LodataRelationship]
    public function calculationNonDestructiveTesting(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationNonDestructiveTesting::class);
    }
    #[LodataRelationship]
    public function calculationMetallography(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationMetallography::class);
    }
    #[LodataRelationship]
    public function calculationTestingScope(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationTestingScope::class);
    }
    #[LodataRelationship]
    public function material(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
    #[LodataRelationship]
    public function hardenabilityRange(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(HardenabilityRange::class);
    }
    #[LodataRelationship]
    public function calculationHardenabilityRange(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationHardenabilityRange::class);
    }
    #[LodataRelationship]
    public function materialAnalysis(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(MaterialAnalysis::class);
    }
    #[LodataRelationship]
    public function calculationMaterialAnalysis(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationMaterialAnalysis::class);
    }
    #[LodataRelationship]
    public function deformation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Deformation::class);
    }
    #[LodataRelationship]
    public function calculationDeformation(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CalculationDeformation::class);
    }

    #[LodataRelationship]
    public function individualNonDestructiveTesting(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(NonDestructiveTesting::class,'non_destructive_testing_individual_id');
    }

    #[LodataRelationship]
    public function individualDeformation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Deformation::class,'deformation_individual_id');
    }
    #[LodataRelationship]
    public function hweWorkPlan(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(HweWorkPlan::class);
    }

    #[LodataRelationship]
    public function prodOrderPos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProdOrderPos::class);
    }
}
