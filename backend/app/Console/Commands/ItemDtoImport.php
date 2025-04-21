<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\ItemType;
use App\Models\PackagingInstruction;
use App\Models\SerialNumberProfile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Jobs\ItemImport as JobsItemImport;
use App\Jobs\MediaImport as JobsMediaImport;
use App\Models\Bom;
use App\Models\Classification;
use App\Models\Customer;
use App\Models\CustomerItem;
use App\Models\Item;
use App\Models\ItemGroup;
use App\Models\ItemPlant;
use App\Models\OperationPlan;
use App\Models\DataImport;
use App\Models\Plant;
use App\Models\StorageLocation;
use App\Models\UnitOfMeasure;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Collection;

class ItemDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:item';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import all items from source system';


    private function createUnitIfNotExists(Collection $units, ?string $custom_id): ?int
    {
        if ($custom_id && !isset($units[$custom_id])) {
            $unitOfMeasure = UnitOfMeasure::firstOrCreate(
                ['custom_id' => $custom_id],
                ['name' => $custom_id, 'is_active' => true]
            );

            $units[$custom_id] = $unitOfMeasure->id;
        }
        return $units[$custom_id] ?? null;
    }

    private function createSerialNumberProfileIfNotExists(Collection $serialNumberProfiles, ?string $custom_id): ?int
    {
        if ($custom_id && !isset($serialNumberProfiles[$custom_id])) {
            $serialNumberProfile = SerialNumberProfile::firstOrCreate(
                ['custom_id' => $custom_id]
            );

            $serialNumberProfiles[$custom_id] = $serialNumberProfile->id;
        }
        return $serialNumberProfiles[$custom_id] ?? null;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        $itemGroups = collect();
        foreach (ItemGroup::all() as $itemGroup) {
            $itemGroups[$itemGroup->custom_id] = $itemGroup->id;
        }

        $itemTypes = collect();
        foreach (ItemType::all() as $itemType) {
            $itemTypes[$itemType->custom_id] = $itemType->id;
        }

        $plants = collect();
        foreach (Plant::all() as $plant) {
            $plants[$plant->custom_id] = $plant->id;
        }

        $storageLocations = collect();
        foreach (StorageLocation::all() as $location) {
            $storageLocations[$location->custom_id] = $location->id;
        }

        $unitOfMeasures = collect();
        foreach (UnitOfMeasure::all() as $unitOfMeasure) {
            $unitOfMeasures[$unitOfMeasure->custom_id] = $unitOfMeasure->id;
        }

        $serialNumberProfiles = collect();
        foreach (SerialNumberProfile::all() as $serialNumberProfile) {
            $serialNumberProfiles[$serialNumberProfile->custom_id] = $serialNumberProfile->id;
        }

        $packagingInstructions = collect();
        foreach (PackagingInstruction::all() as $packagingInstruction) {
            $packagingInstructions[$packagingInstruction->custom_id] = $packagingInstruction->id;
        }

        $customers = collect();
        foreach (Customer::select('id', 'custom_id')->get() as $customer) {
            $customers[$customer->custom_id] = $customer->id;
        }

        while ($itemChunk = $ds->itemDtos($skip, $take)) {
            $skip += $take;
            $xmlIds = [];
            foreach ($itemChunk as $item) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($item->xml_id) && !in_array($item->xml_id, $xmlIds)) {
                    $xmlIds[] = $item->xml_id;
                }

                //Check if item exists
                $query = Item::where('custom_id', $item->custom_id);

                /** @var Item $record */
                $record = $query->first();
                if (!$record) {
                    if (!(isset($item->is_active) && $item->is_active)) {
                        //Do not create new records if they are anyways not active or plant not available
                        continue;
                    }
                    $record = new Item();
                    $record->custom_id = $item->custom_id;
                    $record->is_sales_item = false;
                }

                //This checks if a file with the image_name is already present.
                if (isset($item->image_exists) && isset($item->image_name)) {
                    $mediaItems = $record->getMedia("*");
                    $hasNotImportedImage = true;
                    foreach ($mediaItems as $mediaItem) {
                        $hasNotImportedImage = $mediaItem->name === $item->image_name ? false : true;
                        if ($hasNotImportedImage === false) {
                            break;
                        }
                    }
                    //If image is present via Datasource and not added yet add it to the media DB plus the original file needs to be preserved(otherwise addMedia would delete the image on file share for example)
                    if ($item->image_exists && $hasNotImportedImage) {
                        if (isset($item->image_blob)) {
                            $media = $record->addMediaFromString($item->image_blob)
                                   ->usingFileName($item->custom_id . $item->file_extension)
                                   ->usingName($item->custom_id)
                                   ->toMediaCollection();
                        } else {
                            $media = $record->addMedia($item->path_for_image)->preservingOriginal()->toMediaCollection();
                        }
                        # Set the media as the standard image
                        $media->is_selected = true;
                        $media->save();
                    }
                }

                if (isset($item->custom_operation_plan_id)) {
                    $op = OperationPlan::where('custom_id', $item->custom_operation_plan_id)->first();
                    if (isset($op)) {
                        $record->operation_plan_id = $op->id;
                    }
                } else {
                    $record->operation_plan_id = null;
                }

                if (isset($item->custom_bom_id)) {
                    $bom = Bom::where('custom_id', $item->custom_bom_id)->first();
                    if (isset($bom)) {
                        $record->bom_id = $bom->id;
                    }
                } else {
                    $record->bom_id = null;
                }

                if (isset($item->item_group_custom_id) && $itemGroups->has($item->item_group_custom_id)) {
                    $record->item_group_id = $itemGroups[$item->item_group_custom_id];
                }

                if (isset($item->item_type_custom_id) && $itemTypes->has($item->item_type_custom_id)) {
                    $record->item_type_id = $itemTypes[$item->item_type_custom_id];
                }

                $record->name = $item->name ?? $record->name;
                $record->category = $item->category ?? $record->category;
                $record->is_sales_item = $item->is_sales_item ?? $record->is_sales_item;
                $record->is_active = $item->is_active ?? $record->is_active;
                $record->stock = $item->stock ?? $record->stock;
                $record->hwe_warehouse_material = $item->hwe_warehouse_material ?? $record->hwe_warehouse_material;
                $record->hwe_period_month = $item->hwe_period_month ?? $record->hwe_period_month;
                $record->hwe_period_year = $item->hwe_period_year ?? $record->hwe_period_year;
                $record->hwe_norm_name = $item->hwe_norm_name ?? $record->hwe_warehouse_material;
                $record->price = $item->price ?? $record->price;
                $record->is_alloy = $item->is_alloy ?? $record->is_alloy;

                $record->unit_of_measure_id = $this->createUnitIfNotExists($unitOfMeasures, $item->unit_of_measure_id_custom);
                $record->total_weight = $item->total_weight;
                $record->packaging_instruction_id = $packagingInstructions[$item->packaging_instruction_id_custom] ?? $record->packaging_instruction_id;
                $record->packaging_instruction_id_1 = $packagingInstructions[$item->packaging_instruction_id_1_custom] ?? $record->packaging_instruction_id_1;
                $record->packaging_instruction_id_2 = $packagingInstructions[$item->packaging_instruction_id_2_custom] ?? $record->packaging_instruction_id_2;
                $record->packaging_instruction_id_3 = $packagingInstructions[$item->packaging_instruction_id_3_custom] ?? $record->packaging_instruction_id_3;
                $record->packaging_instruction_id_4 = $packagingInstructions[$item->packaging_instruction_id_4_custom] ?? $record->packaging_instruction_id_4;
                $record->price_plan = $item->price_plan ?? $record->price_plan;
                $record->price_plan_date = $item->price_plan_date ?? $record->price_plan_date;
                $record->packaging_quantity = $item->packaging_quantity ?? $record->packaging_quantity;
                $record->note = $item->note ?? $record->note;
                $record->is_purchased_item = $item->is_purchased_item ?? false;
                $record->is_packaging_item = $item->is_packaging_item ?? false;
                $record->name2 = $item->name2 ?? $record->name2;
                $record->name3 = $item->name3 ?? $record->name3;
                $record->main_tool_id = $item->main_tool_id ?? null;

                if (env('EXTERNAL_DS_TARGET') == 'vop') {
                    $record->is_production_item = $item->is_production_item ?? false;
                } else {
                    $record->is_production_item =  true;
                }

                $record->save();

                if(isset($customers[$item->customer_id_custom])) {
                    CustomerItem::firstOrCreate([
                        'customer_id'   => $customers[$item->customer_id_custom],
                        'item_id'       => $record->id,
                    ]);
                }
                
                foreach ($item->classifications as $classificationDto) {
                    Classification::updateOrCreate(
                        [
                            "model_type" => Item::class,
                            "model_id" => $record->id,
                            "class" => $classificationDto->class,
                            "attribute" => $classificationDto->attribute,
                        ],
                        [
                            "value_string" => $classificationDto->value_string,
                            "value_double" => $classificationDto->value_double,
                        ]
                    );
                }

                $record
                    ->alternativeUnits()
                    ->sync(
                        collect($item->unit_of_measure_conversions)
                            ->mapWithKeys(function ($conversion) use ($unitOfMeasures) {
                                $unitOfMeasure = $this->createUnitIfNotExists($unitOfMeasures, $conversion->unit_of_measure_id_custom);
                                if ($unitOfMeasure) {
                                    return [
                                        $unitOfMeasure => [
                                            'quantity_denominator' => $conversion->quantity_denominator,
                                            'quantity_numerator' => $conversion->quantity_numerator,
                                        ],
                                    ];
                                }
                                return [];
                            })
                    );

                foreach ($item->plants as $plantDto) {
                    if ($plants->has($plantDto->plant_id_custom)) {
                        $plant = $plants[$plantDto->plant_id_custom];
                        /** @var ItemPlant $itemPlant */
                        $itemPlant = ItemPlant::updateOrCreate([
                            'item_id' => $record->id,
                            'plant_id' => $plant,
                        ], [
                            'is_batch_managed' => $plantDto->is_batch_managed,
                            'storage_location_id' => $storageLocations[$plantDto->storage_location_id_custom] ?? null,
                            'storage_location_id_rework' => $storageLocations[$plantDto->storage_location_id_rework_custom] ?? null,
                            'storage_location_id_scrap' => $storageLocations[$plantDto->storage_location_id_scrap_custom] ?? null,
                            'serial_number_profile_id' => $this->createSerialNumberProfileIfNotExists($serialNumberProfiles, $plantDto->serial_number_profile_id_custom),
                        ]);
                        $storageLocationIds = [];
                        foreach ($plantDto->storage_location_ids_custom as $storageLocationId) {
                            if ($storageLocations->has($storageLocationId)) {
                                $storageLocationIds[] = $storageLocations[$storageLocationId];
                            }
                        }
                        $itemPlant->storageLocations()->sync(
                            $storageLocationIds
                        );
                    }
                }
            }

            // $xmlIds is valid then we will update the xmls table.
            if (count($xmlIds) > 0) {
                DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
            }
        }

        if (getenv('V10_DOCVISU_FOLDER_STRUCTURE_LINK') !== false && env('V10_DOCVISU_FOLDER_STRUCTURE_LINK') !== '') {
            $responsefolder = Http::withoutVerifying()->get(env('V10_DOCVISU_FOLDER_STRUCTURE_LINK'))->json();
            for ($i = 0; $i < count($responsefolder); $i++) {
                if ($responsefolder[$i]['structure_name'] === env('V10_DOCVISU_FOLDER_STRUCTURE')) {
                    //v10 expects name instead of structure_name and folder instead of folders
                    $docvisuFolderStructure = ['name' => $responsefolder[$i]['structure_name'], 'folder' => $responsefolder[$i]['folders']];
                }
            }
            //ICT add v10 DOCVisu entry for Items that don't exist in DocVisu
            if (isset($docvisuFolderStructure) && env('V10_DOCVISU_FOLDER_STRUCTURE') !== "") {
                $docVisuProcess = DB::table('items')->whereNotIn('custom_id', function ($query) {
                    $query->select('teile_masch_nr')->from('doc_man.t_process')->where('dep_id', 3);
                })->get();
                foreach ($docVisuProcess as $missing) {
                    //Call v10 api to add the proccess
                    $data = [
                        'service' => 'save_new_porcess',
                        'dep_id' => env('V10_DOCVISU_ITEM_DEPARTMENT_ID'),
                        'name' => '',
                        'other' => '',
                        'bau' => $missing->custom_id,
                        'nr' => $missing->custom_id,
                        'bez' => $missing->name,
                        'u_id' => '-9999',
                        'fol' => json_encode($docvisuFolderStructure, JSON_UNESCAPED_UNICODE),
                        'lock_and_hide' => 0
                    ];
                    $response = Http::asForm()->withoutVerifying()->post(env('V10_DOCVISU_POST_API'), $data);
                }
            }
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new JobsItemImport('sd_teile'));
            $this->dispatch(new JobsMediaImport('t_attachments'));
        }

        return 0;
    }
}
