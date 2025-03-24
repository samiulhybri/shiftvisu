<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CallOff extends Model
{
    use HasFactory;

    static function getCallOffsBetween(\Illuminate\Support\Carbon $start_date, \Illuminate\Support\Carbon $end_date): \Illuminate\Support\Collection
    {
        $select = 'items.id as item_id,
            items.custom_id as item_custom_id,
            items.name as item_name,
            YEAR(call_offs.date) as year,
            WEEK(call_offs.date, 1) as week,
            sum(call_offs.quantity) as quantity';

        $group_by = [
            'items.id',
            'items.custom_id',
            'items.name',
            'year',
            'week'
        ];

        $call_offs = DB::table('call_offs')
            ->select(DB::raw($select))
            ->join('items', 'items.id', 'call_offs.item_id')
            ->where('call_offs.date', '>=', $start_date->toDateString())
            ->where('call_offs.date', '<=', $end_date->toDateString())
            ->groupBy($group_by)
            ->get();

        return $call_offs;
    }

    static function getCallOffsForItemIdBetween(string $item_id, \Illuminate\Support\Carbon $start_date, \Illuminate\Support\Carbon $end_date, string $child_item_id = null): \Illuminate\Support\Collection
    {
        if($child_item_id) {
            $select = 'items.id as item_id,
                items.custom_id as item_custom_id,
                items.name as item_name,
                YEAR(DATE_SUB(call_offs.date, INTERVAL item_bom_children.lead_time_days DAY)) as year,
                WEEK(DATE_SUB(call_offs.date, INTERVAL item_bom_children.lead_time_days DAY), 1) as week,
                sum(call_offs.quantity) as quantity';
        }
        else {
            $select = 'items.id as item_id,
                items.custom_id as item_custom_id,
                items.name as item_name,
                YEAR(call_offs.date) as year,
                WEEK(call_offs.date, 1) as week,
                sum(call_offs.quantity) as quantity';
        }

        $group_by = [
            'items.id',
            'items.custom_id',
            'items.name',
            'year',
            'week'
        ];

        if ($child_item_id) {
            $call_offs = DB::table('call_offs')
                ->select(DB::raw($select))
                ->join('items', 'items.id', 'call_offs.item_id')
                ->join('item_bom_children', 'item_bom_children.item_id', 'items.id')
                ->where('item_bom_children.child_item_id', $child_item_id)
                ->whereRaw('DATE_SUB(call_offs.date, INTERVAL item_bom_children.lead_time_days DAY) <= ?',
                    [$end_date->toDateString()])
                ->where('items.id', $item_id)
                ->groupBy($group_by)
                ->get();
        } else {

            $call_offs = DB::table('call_offs')
                ->select(DB::raw($select))
                ->join('items', 'items.id', 'call_offs.item_id')
                ->where('items.id', $item_id)
                ->where('call_offs.date', '<=', $end_date->toDateString())
                ->groupBy($group_by)
                ->get();
        }

        return $call_offs;
    }
    #[LodataRelationship]
    public function item(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Item::class,'item_id');
    }
    #[LodataRelationship]
    public function prodOrders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProdOrder::class, 'call_off_id');
    }
}
