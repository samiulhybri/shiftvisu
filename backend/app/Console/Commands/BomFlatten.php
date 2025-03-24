<?php

namespace App\Console\Commands;

use App\Models\Item;
use App\Models\ItemBomChild;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BomFlatten extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bom:flatten';

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
        //TODO : This is just a quick and dirty version

        $boms = Item::select(['items.id', 'items.custom_id', 'bom_pos.item_id', 'bom_pos.qty_for_one_parent', 'bom_pos.pos'])
            ->join('boms', 'items.bom_id', 'boms.id')
            ->join('bom_pos', 'bom_pos.bom_id', 'boms.id')
            ->where('bom_pos.is_active', true)
            ->get();

        ItemBomChild::truncate();

        $all_children = collect();
        //First level
        foreach ($boms as $bom) {
            $item_child = new ItemBomChild();
            $item_child->item_id = $bom->id;
            $item_child->child_item_id = $bom->item_id;
            $item_child->qty_child_for_one_parent = $bom->qty_for_one_parent;
            $item_child->pos = $bom->pos;

            //TODO: Custom IHI
            if ($bom->custom_id >= '0000' && $bom->custom_id < '5000') {
                $item_child->lead_time_days = 14;
            } else if ($bom->custom_id >= '5000' && $bom->custom_id < '9000') {
                $item_child->lead_time_days = 28;
            } else {
                $item_child->lead_time_days = 35;
            }

            $all_children->push($item_child->toArray());
        }

        foreach (array_chunk($all_children->toArray(), env('DATA_CHUNK_SIZE')) as $chunk)  
        {
            ItemBomChild::insert($chunk);
        }

        // Second level
        $results = DB::select('select parent.pos as ppos,
                child.pos as cpos,
                parent.item_id,
                child.child_item_id,
                parent.qty_child_for_one_parent as pqty,
                child.qty_child_for_one_parent as cqty,
                items.custom_id
            from item_bom_children as parent
                join item_bom_children as child on parent.child_item_id = child.item_id
                join items on items.id = parent.item_id');

        $all_children = collect();
        //First level
        foreach ($results as $result) {
            $item_child = new ItemBomChild();
            $item_child->item_id = $result->item_id;
            $item_child->child_item_id = $result->child_item_id;
            $item_child->qty_child_for_one_parent = $result->pqty * $result->cqty;
            $item_child->pos = $result->ppos . '.' . $result->cpos;

            //TODO: Custom IHI
            if ($result->custom_id >= '0000' && $result->custom_id < '5000') {
                $item_child->lead_time_days = 14;
            } else if ($result->custom_id >= '5000' && $result->custom_id < '9000') {
                $item_child->lead_time_days = 28;
            } else {
                $item_child->lead_time_days = 35;
            }

            $all_children->push($item_child->toArray());
        }

        foreach (array_chunk($all_children->toArray(), env('DATA_CHUNK_SIZE')) as $chunk)  
        {
            ItemBomChild::insert($chunk);
        }

        // Third level
        $results = DB::select('select parent.pos as ppos,
                child.pos as cpos,
                parent.item_id,
                child.child_item_id,
                parent.qty_child_for_one_parent as pqty,
                child.qty_child_for_one_parent as cqty,
                items.custom_id
            from item_bom_children as parent
                join item_bom_children as child on parent.child_item_id = child.item_id
                join items on items.id = parent.item_id
                where parent.pos like "%.%" and child.pos not like "%.%"');

        $all_children = collect();
        //First level
        foreach ($results as $result) {
            $item_child = new ItemBomChild();
            $item_child->item_id = $result->item_id;
            $item_child->child_item_id = $result->child_item_id;
            $item_child->qty_child_for_one_parent = $result->pqty * $result->cqty;
            $item_child->pos = $result->ppos . '.' . $result->cpos;

            //TODO: Custom IHI
            if ($result->custom_id >= '0000' && $result->custom_id < '5000') {
                $item_child->lead_time_days = 14;
            } else if ($result->custom_id >= '5000' && $result->custom_id < '9000') {
                $item_child->lead_time_days = 28;
            } else {
                $item_child->lead_time_days = 35;
            }

            $all_children->push($item_child->toArray());
        }

        foreach (array_chunk($all_children->toArray(), env('DATA_CHUNK_SIZE')) as $chunk)  
        {
            ItemBomChild::insert($chunk);
        }

        // Fourth level
        $results = DB::select('select parent.pos as ppos,
                child.pos as cpos,
                parent.item_id,
                child.child_item_id,
                parent.qty_child_for_one_parent as pqty,
                child.qty_child_for_one_parent as cqty,
                items.custom_id
            from item_bom_children as parent
                join item_bom_children as child on parent.child_item_id = child.item_id
                join items on items.id = parent.item_id
                where parent.pos like "%.%.%" and child.pos not like "%.%"');

        $all_children = collect();
        //First level
        foreach ($results as $result) {
            $item_child = new ItemBomChild();
            $item_child->item_id = $result->item_id;
            $item_child->child_item_id = $result->child_item_id;
            $item_child->qty_child_for_one_parent = $result->pqty * $result->cqty;
            $item_child->pos = $result->ppos . '.' . $result->cpos;

            //TODO: Custom IHI
            if ($result->custom_id >= '0000' && $result->custom_id < '5000') {
                $item_child->lead_time_days = 14;
            } else if ($result->custom_id >= '5000' && $result->custom_id < '9000') {
                $item_child->lead_time_days = 28;
            } else {
                $item_child->lead_time_days = 35;
            }

            $all_children->push($item_child->toArray());
        }

        foreach (array_chunk($all_children->toArray(), env('DATA_CHUNK_SIZE')) as $chunk)  
        {
            ItemBomChild::insert($chunk);
        }

        // Fifth level
        $results = DB::select('select parent.pos as ppos,
                child.pos as cpos,
                parent.item_id,
                child.child_item_id,
                parent.qty_child_for_one_parent as pqty,
                child.qty_child_for_one_parent as cqty,
                items.custom_id
            from item_bom_children as parent
                join item_bom_children as child on parent.child_item_id = child.item_id
                join items on items.id = parent.item_id
                where parent.pos like "%.%.%.%" and child.pos not like "%.%"');

        $all_children = collect();
        //First level
        foreach ($results as $result) {
            $item_child = new ItemBomChild();
            $item_child->item_id = $result->item_id;
            $item_child->child_item_id = $result->child_item_id;
            $item_child->qty_child_for_one_parent = $result->pqty * $result->cqty;
            $item_child->pos = $result->ppos . '.' . $result->cpos;

            //TODO: Custom IHI
            if ($result->custom_id >= '0000' && $result->custom_id < '5000') {
                $item_child->lead_time_days = 14;
            } else if ($result->custom_id >= '5000' && $result->custom_id < '9000') {
                $item_child->lead_time_days = 28;
            } else {
                $item_child->lead_time_days = 35;
            }

            $all_children->push($item_child->toArray());
        }

        foreach (array_chunk($all_children->toArray(), env('DATA_CHUNK_SIZE')) as $chunk)  
        {
            ItemBomChild::insert($chunk);
        }

        // Sixth level
        $results = DB::select('select parent.pos as ppos,
                child.pos as cpos,
                parent.item_id,
                child.child_item_id,
                parent.qty_child_for_one_parent as pqty,
                child.qty_child_for_one_parent as cqty,
                items.custom_id
            from item_bom_children as parent
                join item_bom_children as child on parent.child_item_id = child.item_id
                join items on items.id = parent.item_id
                where parent.pos like "%.%.%.%.%" and child.pos not like "%.%"');

        $all_children = collect();
        //First level
        foreach ($results as $result) {
            $item_child = new ItemBomChild();
            $item_child->item_id = $result->item_id;
            $item_child->child_item_id = $result->child_item_id;
            $item_child->qty_child_for_one_parent = $result->pqty * $result->cqty;
            $item_child->pos = $result->ppos . '.' . $result->cpos;

            //TODO: Custom IHI
            if ($result->custom_id >= '0000' && $result->custom_id < '5000') {
                $item_child->lead_time_days = 14;
            } else if ($result->custom_id >= '5000' && $result->custom_id < '9000') {
                $item_child->lead_time_days = 28;
            } else {
                $item_child->lead_time_days = 35;
            }

            $all_children->push($item_child->toArray());
        }

        foreach (array_chunk($all_children->toArray(), env('DATA_CHUNK_SIZE')) as $chunk)  
        {
            ItemBomChild::insert($chunk);
        }

        $all_children = collect();
        //Level 0
        foreach (Item::all() as $items) {
            $item_child = new ItemBomChild();
            $item_child->item_id = $items->id;
            $item_child->child_item_id = $items->id;
            $item_child->qty_child_for_one_parent = 1;
            $item_child->pos = '';
            $all_children->push($item_child->toArray());
        }

        foreach (array_chunk($all_children->toArray(), env('DATA_CHUNK_SIZE')) as $chunk)
        {
            ItemBomChild::insert($chunk);
        }

        return 0;
    }
}
