<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HweQsSamplesProdOrderPos extends Model
{
    protected $table = 'hwe_qs_samples_prod_order_pos';
    protected $fillable = ['hwe_qs_sample_id', 'prod_order_pos_id'];

    #[LodataRelationship]
    public function hweQsSample()
    {
        return $this->belongsTo(HweQsSample::class, 'hwe_qs_sample_id');
    }

    #[LodataRelationship]
    public function prodOrderPos()
    {
        return $this->belongsTo(ProdOrderPos::class, 'prod_order_pos_id');
    }

    #[LodataRelationship]
    public function calculation()
    {
        return $this->belongsTo(Calculation::class, 'calculation_id');
    }
}
