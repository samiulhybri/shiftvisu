<?php

namespace App\Console\Commands\JPI;

use App\Models\Hall;
use App\Models\Model\JpiResourceCategory;
use App\Models\Model\JpiResourceGroup;
use App\Models\Model\JpiResource;
use App\Models\Tool;
use App\Models\ToolGroup;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Database\Eloquent\Collection;


class JpiImportToolResources extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:import_tools';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Takes tools with associated tool groups and generates jpi_resources and jpi_resource_groups';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $importedResourceIds = [];

        $jpiResourceCategories = collect();
        foreach (JpiResourceCategory::where('model_type', Hall::class)->get() as $jpiResourceCategory) {
            $jpiResourceCategories[$jpiResourceCategory->model_id] = $jpiResourceCategory->id;
        }

        ToolGroup::chunk(env('DATA_CHUNK_SIZE'), function (Collection $toolGroups) use ($jpiResourceCategories, &$importedResourceIds) {
            foreach ($toolGroups as $toolGroup) {
                if (!$toolGroup->tools) {
                    // Don't import empty tool groups
                    continue;
                }

                if (isset($toolGroup->hall_id) && $jpiResourceCategories->has($toolGroup->hall_id)) {
                    $jpiResourceGroup = JpiResourceGroup::updateOrCreate([
                        'model_id' => $toolGroup->id,
                        'model_type' => ToolGroup::class
                    ], [
                        'name' => $toolGroup->name,
                        'is_deleted' => !($toolGroup->is_active),
                        'jpi_resource_category_id' => $jpiResourceCategories[$toolGroup->hall_id],
                    ]);

                    $resourceIds = [];
                    foreach ($toolGroup->tools as $tool) {
                        $resource = JpiResource::updateOrCreate([
                            'model_id' => $tool->id,
                            'model_type' => Tool::class
                        ], [
                            'name' => "{$tool->custom_id} {$tool->name}",
                            'is_deleted' => !$tool->is_active,
                            'disabled' => !$tool->is_active
                        ]);
                        $importedResourceIds[] = $resource->id;
                        $resourceIds[] = $resource->id;
                    }

                    $jpiResourceGroup->jpiResources()->sync($resourceIds);
                }
            }
        });

        JpiResource::query()
            ->whereNotIn('id', $importedResourceIds)
            ->where('model_type', Tool::class)
            ->update(["is_deleted" => true]);

        return Command::SUCCESS;
    }
}
