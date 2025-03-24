<?php

namespace App\Models;

use App\Enums\MPOffer\MPCostGroup;
use App\Enums\MPOffer\MPCostSubGroup;
use App\Enums\MPOffer\MPCostType;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class MpOffer extends Model implements HasMedia
{
    protected $guarded = ['surplus_internal_personnel', 'surplus_internal_machine'];
    
    use InteractsWithMedia{
        media as protected trait_media;
    }

    use HasFactory;

    #[LodataRelationship]
    public function mpOfferPos(): HasMany
    {
        return $this->hasMany(MpOfferPos::class);
    }

    #[LodataRelationship]
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    #[LodataRelationship]
    public function finalCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'final_customer_id');
    }

    #[LodataRelationship]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    #[LodataRelationship]
    public function mpOfferLog(): HasMany
    {
        return $this->hasMany(MpOfferLog::class);
    }

    #[LodataRelationship]
    public function parentOffer(): BelongsTo
    {
        return $this->belongsTo(MpOffer::class);
    }


    public function createOfferPos()
    {
        foreach(MpCost::all() as $mpCost){
            $mpOfferPos = new MpOfferPos();
            $mpOfferPos->mp_offer_id = $this->id;
            $mpOfferPos->mp_costs_id = $mpCost->id;
            $mpOfferPos->cost_group = $mpCost->cost_group;
            $mpOfferPos->cost_sub_group = $mpCost->cost_sub_group;
            $mpOfferPos->cost_type = $mpCost->cost_type;
            $mpOfferPos->name = $mpCost->name;

            if ($mpOfferPos->cost_type == MPCostType::HOURS() || $mpOfferPos->cost_type == MPCostType::HOURS_FIXED())
            {
                $mpOfferPos->personnel_price = MpPersonnel::where('cost_sub_group', $mpOfferPos->cost_sub_group)->first()?->price;

                $machine = $mpCost->mpCostMachines()->first()?->machine;
                $mpOfferPos->machine_id = $machine?->id;
                $mpOfferPos->machine_price = $machine?->price;
            }

            $mpOfferPos->save();
        }
    }

    public function getTotal()
    {
        return $this->getTotalMaterial() + $this->getTotalExternal() + $this->getTotalInternal();
    }

    public function getTotalSurplus()
    {
        return ($this->getTotalMaterial() * (1 + ($this->surplus_material ?? 0))) +
            ($this->getTotalExternal() * (1 + ($this->surplus_external ?? 0))) +
            ($this->getTotalInternal() * (1 + ($this->surplus_internal ?? 0)));
    }

    public function getTotalSalesPrice()
    {
        return $this->getTotalSurplus() * (1 + ($this->surplus_total) ?? 0);
    }

    public function getMargin()
    {
        return $this->getTotalSalesPrice() - $this->getTotal();
    }

    public function getMarginPercentage()
    {
        $total = $this->getTotal();
        if($total != 0) {
            return ($this->getTotalSalesPrice() / $total - 1) * 100;
        } else {
            return NAN;
        }
    }

    public function getTotalSurplusPercentage()
    {
        $total = $this->getTotal();
        if($total != 0) {
            return ($this->getTotalSurplus() / $total - 1) * 100;
        } else {
            return NAN;
        }
    }

    public function getTotalMaterial()
    {
        return $this->getTotalGroup(MPCostGroup::MATERIAL());
    }

    public function getTotalExternal()
    {
        return $this->getTotalGroup(MPCostGroup::EXTERNAL());
    }

    public function getTotalInternal()
    {
        return $this->getTotalGroup(MPCostGroup::INTERNAL());
    }

    public function getTotalGroup(MPCostGroup $mpCostGroup)
    {
        $total = 0;
        foreach ($this->mpOfferPos->where('cost_group', $mpCostGroup) as $mpOfferPos)
        {
            $total += $mpOfferPos->getTotal() ?? 0;
        }
        return $total;
    }

    public function getTotalSubGroup(MPCostSubGroup $mpCostSubGroup)
    {
        $total = 0;
        foreach ($this->mpOfferPos->where('cost_sub_group', $mpCostSubGroup) as $mpOfferPos)
        {
            $total += $mpOfferPos->getTotal() ?? 0;
        }
        return $total;
    }

    public function getSurplusMaterial() {
        return ($this->surplus_material * 100);
    }

    public function getSurplusInternal() {
        return ($this->surplus_internal * 100);
    }
    
    public function getSurplusExternal() {
        return ($this->surplus_external * 100);
    }

    public function getSurplusTotal() {
        return ($this->surplus_total * 100);
    }

    public function getSurplusInternalPerson() {
        return ($this->surplus_internal_personnel * 100);
    }

    public function getSurplusInternalMachine() {
        return ($this->surplus_internal_machine * 100);
    }

    public function getTotalPersonHours(MPCostSubGroup $mpCostSubGroup) {
        $total = 0;
        foreach ($this->mpOfferPos->where('cost_sub_group', $mpCostSubGroup) as $mpOfferPos)
        {
            $total += $mpOfferPos->getPersonHours() ?? 0;
        }
        return $total;
    }

    public function getTotalMachineHours(MPCostSubGroup $mpCostSubGroup) {
        $total = 0;
        foreach ($this->mpOfferPos->where('cost_sub_group', $mpCostSubGroup) as $mpOfferPos)
        {
            $total += $mpOfferPos->getMachineHours() ?? 0;
        }
        return $total;
    }

    public function getTotalHours(MPCostSubGroup $mpCostSubGroup) {
        $total = 0;
        foreach ($this->mpOfferPos->where('cost_sub_group', $mpCostSubGroup) as $mpOfferPos)
        {
            $per_hour = $mpOfferPos->getPersonHours() ?? 0;
            $mach_hour = $mpOfferPos->getMachineHours() ?? 0;
            $total += $per_hour + $mach_hour;
        }
        return $total;
    }

    public function getTotalInternalHours() {
        $total = $this->getTotalSummaryMachineHours() + $this->getTotalSummaryPersonalHours();
        return $total;
    }

    public function getTotalSummaryPersonalHours() {
        $total = $this->getTotalPersonHours(MPCostSubGroup::INTERNAL_TECH_OFFICE())
                + $this->getTotalPersonHours(MPCostSubGroup::INTERNAL_MACHINING())
                + $this->getTotalPersonHours(MPCostSubGroup::INTERNAL_EROSION())
                + $this->getTotalPersonHours(MPCostSubGroup::INTERNAL_ASSEMBLY())
                + $this->getTotalPersonHours(MPCostSubGroup::INTERNAL_SAMPLING())
                + $this->getTotalPersonHours(MPCostSubGroup::INTERNAL_QUALITY());
        return $total;
    }

    public function getTotalSummaryMachineHours() {
        $total = $this->getTotalSummaryPersonalHours() + $this->getTotalMachineHours(MPCostSubGroup::INTERNAL_TECH_OFFICE())
                + $this->getTotalMachineHours(MPCostSubGroup::INTERNAL_MACHINING())
                + $this->getTotalMachineHours(MPCostSubGroup::INTERNAL_EROSION())
                + $this->getTotalMachineHours(MPCostSubGroup::INTERNAL_ASSEMBLY())
                + $this->getTotalMachineHours(MPCostSubGroup::INTERNAL_SAMPLING())
                + $this->getTotalMachineHours(MPCostSubGroup::INTERNAL_QUALITY());
        return $total;
    }

    public function getTotalPersonCosts(MPCostSubGroup $mpCostSubGroup) {
        $total = 0;
        foreach ($this->mpOfferPos->where('cost_sub_group', $mpCostSubGroup) as $mpOfferPos) {
            $total += $mpOfferPos->getPersonTotal() ?? 0;
        }
        return $total;
    }

    public function getTotalMachineCosts(MPCostSubGroup $mpCostSubGroup) {
        $total = 0;
        foreach ($this->mpOfferPos->where('cost_sub_group', $mpCostSubGroup) as $mpOfferPos) {
            $total += $mpOfferPos->getMachineTotal() ?? 0;
        }
        return $total;
    }

    public function getAllPersonCosts() {
        $total = 0;
        $total += $this->getTotalPersonCosts(MPCostSubGroup::INTERNAL_ASSEMBLY()) + $this->getTotalPersonCosts(MPCostSubGroup::INTERNAL_MACHINING()) + $this->getTotalPersonCosts(MPCostSubGroup::INTERNAL_QUALITY()) + $this->getTotalPersonCosts(MPCostSubGroup::INTERNAL_SAMPLING()) + $this->getTotalPersonCosts(MPCostSubGroup::INTERNAL_TECH_OFFICE()) + $this->getTotalPersonCosts(MPCostSubGroup::INTERNAL_EROSION());
        return $total;
    }

    public function getAllMachineCosts() {
        $total = 0;
        $total += $this->getTotalMachineCosts(MPCostSubGroup::INTERNAL_ASSEMBLY()) + $this->getTotalMachineCosts(MPCostSubGroup::INTERNAL_MACHINING()) + $this->getTotalMachineCosts(MPCostSubGroup::INTERNAL_QUALITY()) + $this->getTotalMachineCosts(MPCostSubGroup::INTERNAL_SAMPLING()) + $this->getTotalMachineCosts(MPCostSubGroup::INTERNAL_TECH_OFFICE()) + $this->getTotalMachineCosts(MPCostSubGroup::INTERNAL_EROSION());
        return $total;
    }

    #[LodataRelationship]
    public function media(): MorphMany
    {
        return $this->trait_media();
    }
}
