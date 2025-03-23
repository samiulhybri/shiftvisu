<?php

namespace App\Models;

use App\Enums\MPOffer\MPCostType;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MpOfferPos extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function machine(): BelongsTo {
        return $this->belongsTo(Machine::class);
    }

    #[LodataRelationship]
    public function mpCost(): BelongsTo {
        return $this->belongsTo(MpCost::class,'mp_costs_id');
    }

    #[LodataRelationship]
    public function mpOffer(): BelongsTo {
        return $this->belongsTo(MpOffer::class);
    }

    #[LodataRelationship]
    public function mpMaterial(): BelongsTo {
        return $this->belongsTo(MpMaterial::class);
    }

    #[LodataRelationship]
    public function supplier(): BelongsTo {
        return $this->belongsTo(Supplier::class);
    }

    public function isRowShow($pos) {
        $show = true;
        if(($pos['name'] == 'Campionatura funzionale (< 30 pezzi)' || $pos['name'] == 'Stampaggio') && $pos['total'] == 0) {
            $show = false;
        }
        return $show;
    }

    public function getDensity() {
        if($this->mpMaterial) {
            return $this->mpMaterial->density;
        }
        return 1;
    }

    public function getPrice() {
        if($this->mpMaterial) {
            return $this->mpMaterial->price;
        }
        return 1;
    }

    public function getPersonHours() {
        if($this->personnel_quantity) {
            return $this->personnel_quantity;
        }
        return 0;
    }

    public function getMachineHours() {
        if($this->machine_quantity) {
            return $this->machine_quantity;
        }
        return 0;
    }

    public function getTotal() {
        switch ($this->cost_type) {
            case "DIMENSION":
                $this->total = ((($this->length ?? 0) * ($this->height ?? 0) * ($this->width ?? 0) * ($this->getPrice() ?? 0) * ($this->getDensity() ?? 0)) / 1000000);
                return $this->total;
            case "OFFER": 
                return ($this->total ?? 0);
            case "FIXED":
                return ($this->total ?? 0);
            case "FIXED_NAME":
                return ($this->total ?? 0);
            case "WEIGHT":
                $this->total = ($this->quantity ?? 0) * ($this->price ?? 0);
                return $this->total;
            case "PIECES":
                $this->total = ($this->quantity ?? 0) * ($this->price ?? 0);
                return $this->total;
            case "HOURS":
                $this->total = ((($this->machine_quantity ?? 0) + ($this->personnel_quantity ?? 0)) * ($this->machine_price ?? 0) + ($this->personnel_quantity ?? 0) * ($this->personnel_price ?? 0));
                return $this->total;
            case "HOURS_FIXED";
                $this->total = (($this->personnel_quantity ?? 0) * ($this->machine_price ?? 0) + ($this->personnel_quantity ?? 0) * ($this->personnel_price ?? 0));
                return $this->total;
            case "PF_PM":
                return ($this->total ?? 0);
            case "MOULDFLOW":
                return ($this->total ?? 0);
            case "FIXED_WEIGHT":
                $this->total = (($this->quantity ?? 0) * ($this->price ?? 0));
                return $this->total;
            default:
                return 0;
        }
    }

    public function getPersonTotal() {
        $total = 0;
        if($this->cost_type == MPCostType::HOURS() || $this->cost_type == MPCostType::HOURS_FIXED()) {
            $total = ($this->personnel_quantity ?? 0) * ($this->personnel_price ?? 0);
        } 
        return $total;
    }

    public function getMachineTotal() {
        $total = 0;
        if($this->cost_type == MPCostType::HOURS() || $this->cost_type == MPCostType::HOURS_FIXED()) {
            $total = (($this->personnel_quantity ?? 0) * ($this->machine_price ?? 0)) + (($this->machine_quantity ?? 0) * ($this->machine_price ?? 0));
        }
        return $total;
    }
}
