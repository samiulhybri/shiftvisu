<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class  HweCertificate extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function sample(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
       return $this->belongsTo(ProdOrderPos::class, 'prod_order_pos_id_qs_samples');
    }
    #[LodataRelationship]
    public function ultrasonic(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProdOrderPos::class, 'prod_order_pos_id_ultrasonic');
    }
    #[LodataRelationship]
    public function surface(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProdOrderPos::class, 'prod_order_pos_id_surface');
    }
    #[LodataRelationship]
    public function heatTreatment(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
       return $this->belongsTo(ProdOrderPos::class, 'prod_order_pos_id_heat_treatment');
    }
    #[LodataRelationship]
    public function hweCertificateHweQsSamples(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
       return $this->hasMany(HweCertificateHweQsSample::class);
    }
}
