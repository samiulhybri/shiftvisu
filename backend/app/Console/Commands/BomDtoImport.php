<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Bom;
use App\Models\BomPos;
use App\Models\Item;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BomDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:bom';

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
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');
        $xmlIds = [];

        $items = collect();
        foreach (Item::all() as $item) {
            $items[$item->custom_id] = $item->id;
        }

        while ($chunk = $ds->bomDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $bom) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($bom->xml_id) && !in_array($bom->xml_id, $xmlIds)) {
                    $xmlIds[] = $bom->xml_id;
                }

                $record = Bom::where('custom_id', $bom->custom_id)->first();
                if (!$record) {
                    $record = new Bom();
                    $record->custom_id = $bom->custom_id;
                }


                if (isset($bom->name)) {
                    $record->name = $bom->name;
                }

                $record->save();

                foreach ($bom->bom_pos as $pos) {
                    $record_pos = BomPos::where('bom_id', $record->id)
                        ->where('custom_pos', $pos->custom_pos)
                        ->first();

                    if (!$record_pos) {
                        $record_pos = new BomPos();
                        $record_pos->bom_id = $record->id;
                        $record_pos->custom_pos = $pos->custom_pos;
                        $record_pos->pos = $pos->custom_pos;
                    }

                    if ($pos->item_id_custom && $items->has($pos->item_id_custom)) {
                        $record_pos->item_id = $items[$pos->item_id_custom];
                        $record_pos->qty_for_one_parent = $pos->qty_for_one_parent;
                        $record_pos->is_active = $pos->is_active;
                        $record_pos->save();
                    } else {
                        Log::error("BomDtoImport: Item {$pos->item_id_custom} not found");
                    }
                }
            }
        }

        // $xmlIds is valid then we will update the xmls table.
        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }
        return 0;
    }
}
