<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Enums\UserType;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\User;
use App\Jobs\UserImport as JobsUserImport;
use App\Models\DataImport;
use App\Models\UserGroup;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Collection;

class UserDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import all users from source system';

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

        $usersIdMap = collect();
        foreach (User::all() as $user) {
            $usersIdMap[$user->custom_id] = $user->id;
        }

        $userGroupMap = collect();
        foreach (UserGroup::all() as $userGroup) {
            $userGroupMap[$userGroup->custom_id] = $userGroup->id;
        }

        $xmlIds = [];
        while ($chunk = $ds->userDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $user) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($user->xml_id) && !in_array($user->xml_id, $xmlIds)) {
                    $xmlIds[] = $user->xml_id;
                }

                // check password is hashed or not
                if (isset($user->password)) {
                    if (strlen($user->password) !== 60 || !preg_match('/^\$2[axy]\$[0-9]{2}\$[A-Za-z0-9.\/]{53}$/', $user->password)) {
                        $user->password = password_hash($user->password, PASSWORD_BCRYPT);
                    }
                }

                //Check if user exists
                $record = User::where('custom_id', $user->custom_id)->first();
                if (!$record) {
                    if (!(isset($user->is_active) && $user->is_active)) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new User();
                    $record->custom_id = $user->custom_id;
                    $record->password = '';

                    if (!isset($user->username) || (strlen($user->username) == 0)) {
                        $record->username = $user->custom_id;
                    }

                    if (!isset($user->is_supervisor)) {
                        $record->is_supervisor = 0;
                    }

                    if (!isset($user->user_type)) {
                        $record->user_type = UserType::GUEST();
                    }
                }

                $record->name = $user->name ?? $record->name;
                $record->is_active = $user->is_active ?? $record->is_active;
                $record->remember_token = $user->remember_token ?? $record->remember_token;
                $record->email_verified_at = $user->email_verified_at ?? $record->email_verified_at;
                $record->password = $user->password ?? $record->password;
                $record->chip_number = $user->chip_number ?? $record->chip_number;
                $record->username = $user->username ?? $record->username;
                $record->is_supervisor = $user->is_supervisor ?? $record->is_supervisor;
                $record->user_type = $user->user_type ?? $record->user_type;
                $record->user_short_code = $user->user_short_code ?? $record->user_short_code;

                $firstSupervisorCustomId = $user->supervisor_1_id_custom ?? NULL;
                $secondSupervisorCustomId = $user->supervisor_2_id_custom ?? NULL;

                if ($firstSupervisorCustomId != NULL && $firstSupervisorCustomId != '') {
                    if (isset($usersIdMap[$firstSupervisorCustomId])) {
                        $record->supervisor1_user_id = $usersIdMap[$firstSupervisorCustomId];
                    } else {
                        $record->supervisor1_user_id = NULL;
                    }
                } else {
                    $record->supervisor1_user_id = NULL;
                }

                if ($secondSupervisorCustomId != NULL && $secondSupervisorCustomId != '') {
                    if (isset($usersIdMap[$secondSupervisorCustomId])) {
                        $record->supervisor2_user_id = $usersIdMap[$secondSupervisorCustomId];
                    } else {
                        $record->supervisor2_user_id = NULL;
                    }
                } else {
                    $record->supervisor2_user_id = NULL;
                }

                if (isset($user->email) && strlen($user->email) > 0) {
                    $record->email = $user->email ?? $record->email;
                } else if (!$record->email) {
                    $record->email = $record->custom_id;
                }

                try {
                    $record->is_imported_from_erp = true;
                    $record->save();

                    if ($user->userGroupDtos) {
                        $userGroups = [];
                        foreach ($user->userGroupDtos as $userGroupDto) {
                            $userGroups[] = $this->createUserGroupIfNotExists($userGroupMap, $userGroupDto->custom_id);
                        }
                        $record->userGroup()->sync($userGroups);
                    }


                } catch (\Exception $e) {
                    print_r($e);
                    continue;
                }
            }
        }


        // $xmlIds is valid then we will update the xmls table.
        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new JobsUserImport('sd_mitarbeiter'));
        }

        return 0;
    }


    private function createUserGroupIfNotExists(Collection $userGroups, ?string $custom_id): ?int
    {
        if ($custom_id && !isset($userGroups[$custom_id])) {
            $userGroup = UserGroup::query()->firstOrCreate(
                ['custom_id' => $custom_id],
                ['name' => $custom_id, 'is_active' => true, 'is_imported_from_erp' => true]
            );

            $userGroups[$custom_id] = $userGroup->id;
        }
        return $userGroups[$custom_id] ?? null;
    }
}
