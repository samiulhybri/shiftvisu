<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Item;
use App\Models\PackagingInstruction;
use App\Models\PackagingInstructionPos;
use App\Models\UnitOfMeasure;
use Illuminate\Console\Command;

class PackagingInstructionDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:packaging_instructions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();

        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        $unitsOfMeasure = collect();
        foreach (UnitOfMeasure::all() as $unit) {
            $unitsOfMeasure[$unit->custom_id] = $unit->id;
        }
        while ($instructionChunk = $ds->packagingInstructionDtos($skip, $take)) {
            $skip += $take;
            foreach ($instructionChunk as $instructionDto) {
                $instruction = PackagingInstruction::updateOrCreate(
                    [
                        'custom_id' => $instructionDto->custom_id,
                    ],
                    [
                        'is_active' => $instructionDto->is_active,
                        'uuid' => $instructionDto->uuid,
                    ]
                );

                $importedPos = [];

                foreach ($instructionDto->positions as $posDto) {
                    if ($posDto->subordinate_packaging_instruction_uuid) {
                        $packable_id = PackagingInstruction::where('uuid', $posDto->subordinate_packaging_instruction_uuid)
                            ->first()?->id;
                        $packable_type = PackagingInstruction::class;
                    } else {
                        $packable_id = Item::where('custom_id', $posDto->packed_item_id_custom)->first()->id;
                        $packable_type = Item::class;
                    }

                    if (!$packable_id) {
                        continue;
                    }

                    if (isset($importedPos[$posDto->pos]) && $importedPos[$posDto->pos]->is_active) {
                        // We've already imported a pos with this pos, because it was active it takes precedence
                        continue;
                    }
                    $importedPos[$posDto->pos] = $posDto;

                    if ($posDto->unit_of_measure_id_custom && !isset($unitsOfMeasure[$posDto->unit_of_measure_id_custom])) {
                        $unitOfMeasure = new UnitOfMeasure();
                        $unitOfMeasure->custom_id = $posDto->unit_of_measure_id_custom;
                        $unitOfMeasure->name = $posDto->unit_of_measure_id_custom;
                        $unitOfMeasure->is_active = true;
                        $unitOfMeasure->save();
                        $unitsOfMeasure[$posDto->unit_of_measure_id_custom] = $unitOfMeasure->id;
                    }

                    PackagingInstructionPos::updateOrCreate(
                        [
                            'packaging_instruction_id' => $instruction->id,
                            'pos' => $posDto->pos,
                        ],
                        [
                            'packable_type' => $packable_type,
                            'packable_id' => $packable_id,
                            'is_container' => $posDto->is_container,
                            'target_quantity' => $posDto->target_quantity,
                            'unit_of_measure_id' => $unitsOfMeasure[$posDto->unit_of_measure_id_custom] ?? null,
                        ]
                    );
                }
            }
        }
    }
}
