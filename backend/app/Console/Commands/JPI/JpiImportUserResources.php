<?php

namespace App\Console\Commands\JPI;

use App\Models\Hall;
use App\Models\JpiCalendarException;
use App\Models\JpiWorkTimePerWeekday;
use App\Models\Model\JpiResource;
use App\Models\Model\JpiResourceCategory;
use App\Models\Model\JpiResourceGroup;
use App\Models\User;
use App\Models\UserGroup;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Database\Eloquent\Collection;


class JpiImportUserResources extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jpi:import_users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Takes users with associated user groups and generates jpi_resources and jpi_resource_groups';

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

        UserGroup::chunk(env('DATA_CHUNK_SIZE'), function (Collection $userGroups) use ($jpiResourceCategories, &$importedResourceIds) {
            foreach ($userGroups as $userGroup) {
                if (isset($userGroup->hall_id) && $jpiResourceCategories->has($userGroup->hall_id)) {
                    $jpiResourceGroup = JpiResourceGroup::updateOrCreate([
                        'model_id' => $userGroup->id,
                        'model_type' => UserGroup::class
                    ], [
                        'model_type' => UserGroup::class,
                        'model_id' => $userGroup->id,
                        'name' => $userGroup->name,
                        'is_deleted' => !($userGroup->is_active),
                        'jpi_resource_category_id' => $jpiResourceCategories[$userGroup->hall_id],
                    ]);

                    $resourceIds = [];
                    foreach ($userGroup->users as $user) {
                        /** @var JpiResource $resource */
                        $resource = JpiResource::updateOrCreate(
                            [
                                'model_id' => $user->id,
                                'model_type' => User::class,
                            ],
                            [
                                'name' => "{$user->custom_id} {$user->name}",
                                'is_deleted' => !($user->is_active),
                                'disabled' => !$user->is_active
                            ]
                        );
                        $workTime = JpiImportMachineResources::calculateWorktimePerWeekday($resource->id, $user->shiftModel);
                        $resource->workTimePerWeekdays()->delete();
                        JpiWorkTimePerWeekday::query()->insert($workTime);

                        $exceptions = JpiImportMachineResources::calculateCalendarExceptions($user, $resource->id, $workTime);
                        $resource
                            ->calendarExceptions()
                            ->where('date', '>=', Carbon::now()->toDateString())
                            ->delete();
                        JpiCalendarException::query()->insert($exceptions);

                        $importedResourceIds[] = $resource->id;
                        $resourceIds[] = $resource->id;
                    }

                    $jpiResourceGroup->jpiResources()->sync($resourceIds);
                } else {
                    //TODO: For now exclude resource groups that are not associated with hall
                    //                    $jpiResourceGroup = JpiResourceGroup::updateOrCreate([
                    //                        'model_id' => $userGroup->id,
                    //                        'model_type' => UserGroup::class
                    //                    ], [
                    //                        'model_type' => UserGroup::class,
                    //                        'model_id' => $userGroup->id,
                    //                        'name' => $userGroup->name,
                    //                        'is_deleted' => !($userGroup->is_active),
                    //                    ]);
                }
            }
        });

        JpiResource::query()
            ->whereNotIn('id', $importedResourceIds)
            ->where('model_type', User::class)
            ->update(["is_deleted" => true]);

        return Command::SUCCESS;
    }
}
