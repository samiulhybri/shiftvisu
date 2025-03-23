<?php

namespace App\Console\Commands;

use App\Enums\SectionActivatableTypes;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\CostCenter;
use App\Models\DataImport;
use App\Models\Hall;
use App\Models\Machine;
use App\Models\MachineGroup;
use App\Models\Plant;
use App\Models\ProductionSupplyArea;
use App\Models\StandardValueKey;
use App\Services\ImportFromBTPService;
use Exception;
use Illuminate\Console\Command;
use App\Jobs\MachineImport as JobsMachineImport;
use App\Models\ResourceGroup;
use App\Models\SectionActivatable;
use App\Models\TpmSubGroup;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MachineDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:machine';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    protected ImportFromBTPService $apiService;

    public function __construct(ImportFromBTPService $apiService)
    {
        parent::__construct();
        $this->apiService = $apiService;
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

        $xmlIds = [];
        $sourceCustomIds = [];
        $machineIds = [];

        /**
         * I will take single machine info here.
         * because later we need all columns of a single machine
         * Take a look outside the nested foreach loop block
         */
        $machineDefinition = null;

        $costCenters = collect();
        foreach (CostCenter::all() as $costCenter) {
            $costCenters[$costCenter->custom_id] = $costCenter->id;
        }

        $resourceGroups = collect();
        foreach (ResourceGroup::all() as $resourceGroup) {
            $resourceGroups[$resourceGroup->custom_id] = $resourceGroup->id;
        }

        $plants = collect();
        foreach (Plant::all() as $plant) {
            $plants[$plant->custom_id] = $plant->id;
        }

        $supplyAreas = collect();
        foreach (ProductionSupplyArea::all() as $supplyArea) {
            $supplyAreas[$supplyArea->custom_id] = $supplyArea->id;
        }

        $standardValueKeys = collect();
        foreach (StandardValueKey::all() as $standardValueKey) {
            $standardValueKeys[$standardValueKey->custom_id] = $standardValueKey->id;
        }

        while ($machineChunk = $ds->machineDtos($skip, $take)) {
            $skip += $take;

            foreach ($machineChunk as $machine) {
                $sourceCustomIds[] = $machine->custom_id;
                // we will update one xml id only one time
                // keep unique ids
                if (isset($machine->xml_id) && !in_array($machine->xml_id, $xmlIds)) {
                    $xmlIds[] = $machine->xml_id;
                }

                $machineDefinition = $machineDefinition ?? $machine;
                /**
                 * @var Machine $record
                 */
                $record = Machine::where('custom_id', $machine->custom_id)->first();
                if (!$record) {
                    if (!(isset($machine->is_active) && $machine->is_active)) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }

                    $record = new Machine();
                    $record->custom_id = $machine->custom_id;
                    $record->usage_factor = 1;
                    $record->tr = 0;
                    $record->construction_year = null;
                    $record->is_furnace = 0;
                    $record->is_casting_machine = 0;
                    $record->is_active = 1;
                }

                if (isset($machine->machine_group_id_custom)) {
                    if (MachineGroup::where('custom_id', $machine->machine_group_id_custom)->first()) {
                        $record->machine_group_id = MachineGroup::where('custom_id', $machine->machine_group_id_custom)->first()->id;
                    } else {
                        $record->machine_group_id = null;
                    }
                }

                if (isset($machine->tpm_sub_group_id_custom)) {
                    if (TpmSubGroup::where('custom_id', $machine->tpm_sub_group_id_custom)->first()) {
                        $record->tpm_sub_group_id = TpmSubGroup::where('custom_id', $machine->tpm_sub_group_id_custom)->first()->id;
                    } else {
                        $record->tpm_sub_group_id = null;
                    }
                }

                foreach ($machine->name as $name) {
                    // TODO: set translated properties
                    if ($name->language === config('app.fallback_locale')) {
                        $record->name = $name->value;
                    }
                }

                $record->usage_factor = $machine->usage_factor ?? $record->usage_factor;
                $record->is_furnace = $machine->is_furnace ?? $record->is_furnace;
                $record->is_casting_machine = $machine->is_casting_machine ?? $record->is_casting_machine;

                if (env('EXTERNAL_DS_TARGET') == 'die') {
                    $record->is_active = $record->is_active ?? $machine->is_active;
                } else {
                    $record->is_active = $machine->is_active ?? $record->is_active;
                }
                $record->construction_year = $machine->construction_year ?? $record->construction_year;
                $record->lead_time_days = $machine->lead_time_days ?? $record->lead_time_days ?? 0;

                if (!$machine->plant_id_custom) {
                    $record->plant_id = $plants->first();
                } else if ($plants->has($machine->plant_id_custom)) {
                    $record->plant_id = $plants[$machine->plant_id_custom];
                } else {
                    continue;
                }

                $record->production_supply_area_id = $supplyAreas[$machine->production_supply_area_id_custom] ?? null;
                if ($machine->standard_value_key_id_custom) {
                    if (!isset($standardValueKeys[$machine->standard_value_key_id_custom])) {
                        $svk = new StandardValueKey();
                        $svk->custom_id = $machine->standard_value_key_id_custom;
                        $svk->is_active = true;
                        $svk->save();

                        $standardValueKeys[$machine->standard_value_key_id_custom] = $svk->id;
                    }
                    $record->standard_value_key_id = $standardValueKeys[$machine->standard_value_key_id_custom];
                }

                if (isset($machine->hall_id_custom) && Hall::where('custom_id', $machine->hall_id_custom)->first()) {
                    $record->hall_id = Hall::where('custom_id', $machine->hall_id_custom)->first()->id;
                }

                if (isset($machine->cost_center_id_custom) && $costCenters->has($machine->cost_center_id_custom)) {
                    $record->cost_center_id = $costCenters[$machine->cost_center_id_custom];
                }

                $record->is_imported_from_erp = 1;

                $record->save();

                if (count($machine->resource_groups_ids_custom) > 0) {
                    $record->resourceGroups()->detach();
                    foreach ($machine->resource_groups_ids_custom as $resourceGroupId) {
                        if ($resourceGroups->has($resourceGroupId)) {
                            $record->resourceGroups()->attach($resourceGroups[$resourceGroupId]);
                        }
                    }
                }

                $newMachine = Machine::where(['custom_id' => $machine->custom_id])->first();
                $machineIds[] = $newMachine->id;

                if ($newMachine && isset($machine->is_enabled_for_tpm_visu)) {
                    $sectionActivatable = SectionActivatable::where([
                        'activatable_type' => Machine::class,
                        'activatable_id' => $newMachine->id,
                        'section' => SectionActivatableTypes::TPMVISU()
                    ])->first();

                    if ($sectionActivatable) {
                        $sectionActivatable->is_active = $machine->is_enabled_for_tpm_visu;
                    } else {
                        $sectionActivatable = new SectionActivatable();
                        $sectionActivatable->activatable_type = Machine::class;
                        $sectionActivatable->activatable_id = $newMachine->id;
                        $sectionActivatable->section = SectionActivatableTypes::TPMVISU();
                        $sectionActivatable->is_active = $machine->is_enabled_for_tpm_visu;
                    }
                    $sectionActivatable->save();
                }
                if ($newMachine && isset($machine->is_enabled_for_plan_visu)) {
                    $sectionActivatable = SectionActivatable::where([
                        'activatable_type' => Machine::class,
                        'activatable_id' => $newMachine->id,
                        'section' => SectionActivatableTypes::PLANVISU()
                    ])->first();

                    if ($sectionActivatable) {
                        $sectionActivatable->is_active = $machine->is_enabled_for_plan_visu;
                    } else {
                        $sectionActivatable = new SectionActivatable();
                        $sectionActivatable->activatable_type = Machine::class;
                        $sectionActivatable->activatable_id = $newMachine->id;
                        $sectionActivatable->section = SectionActivatableTypes::PLANVISU();
                        $sectionActivatable->is_active = $machine->is_enabled_for_plan_visu;
                    }
                    $sectionActivatable->save();
                }
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        if (!isset($machineDefinition)) {
            // Dto import might be disabled. We should not delete data.
            return 0;
        }

        // Now we will handle the deletion
        // delete the rows that are not exists in their ERP anymore
        if (env('DELETE_WHEN_SYNC_DATA') == true) {
            Machine::whereNotIn('custom_id', $sourceCustomIds)
                ->where('is_imported_from_erp', '=', 1)
                ->update(['is_active' => 0]);

            SectionActivatable::whereNotIn('activatable_id', $machineIds)
                ->where('activatable_type', '=', Machine::class)
                ->update(['is_active' => 0]);
        }


        $hosts = Machine::whereRaw('LENGTH(host_iot_gateway) > 0')
            ->distinct()
            ->pluck('host_iot_gateway');

        foreach ($hosts as $host) {
            $destination = $this->getCurlyBracketContent($host ?? '');

            try {
                $url = "api/import-machine-states";

                if ($destination)
                    $response = $this->apiService->executeHttpRequestInBtp($url, $destination, 'POST');
                else
                    $response = Http::post("{$host}{$url}");

                if ($response->failed())
                    throw new Exception($response->body());
            } catch (Exception $e) {
                // Log the error or handle it as needed
                Log::error("Failed to update machine states on host {$host}: " . $e->getMessage());
            }

            try {
                $url = "api/import-machines";

                if ($destination)
                    $response = $this->apiService->executeHttpRequestInBtp($url, $destination, 'POST');
                else
                    $response = Http::post("{$host}{$url}");

                if ($response->failed())
                    throw new Exception($response->body());
            } catch (Exception $e) {
                // Log the error or handle it as needed
                Log::error("Failed to update machines on host {$host}: " . $e->getMessage());
            }
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {

            $toUpdate = collect([]);

            if (isset($machineDefinition->name)) $toUpdate->add('maschinenbez');
            if (isset($machineDefinition->machine_group_id_custom)) $toUpdate->add('maschinengruppe');
            if (isset($machineDefinition->tpm_sub_group_id_custom)) $toUpdate->add('maschinengruppe_tpm');
            if (isset($machineDefinition->hall_id_custom)) $toUpdate->add('halle');
            if (isset($machineDefinition->is_furnace)) $toUpdate->add('is_furnace');
            if (isset($machineDefinition->is_casting_machine)) $toUpdate->add('is_casting_machine');
            if (isset($machineDefinition->construction_year)) $toUpdate->add('baujahr');
            if (isset($machineDefinition->is_active)) $toUpdate->add('aktiv_inaktiv');
            if (isset($machineDefinition->is_enabled_for_tpm_visu)) $toUpdate->add('tpmvisu');

            $this->dispatch((new JobsMachineImport('sd_maschine', $toUpdate->toArray(), env('DELETE_WHEN_SYNC_DATA'), $sourceCustomIds)));
        }

        return 0;
    }

    private function getCurlyBracketContent($string)
    {
        if (preg_match('/\{(.+?)}/', $string, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
