<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Enums\UserType;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\User;
use App\Jobs\UserImport as JobsUserImport;
use App\Models\DataImport;
use App\Models\Hall;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Facades\DB;

class UserImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:user';

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
        $users = $ds->users();

        $usersIdMap = [];
        foreach (User::all() as $user) {
            $usersIdMap[$user->custom_id] = $user->id;
        }

        $halls = Hall::all(['id', 'custom_id'])->pluck('id', 'custom_id');

        $xmlIds = [];
        foreach ($users as $userChunks) {
            foreach ($userChunks as $user) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($user['xml_id']) && !in_array($user['xml_id'], $xmlIds)) {
                    $xmlIds[] = $user['xml_id'];
                }

                // check password is hashed or not
                if (isset($user['password'])) {
                    if (strlen($user['password']) === 60 && preg_match('/^\$2[axy]\$[0-9]{2}\$[A-Za-z0-9\.\/]{53}$/', $user['password'])) {
                        // password is already hashed. Nothing to do.
                    } else {
                        $user['password'] = password_hash($user['password'], PASSWORD_BCRYPT);
                    }
                }

                //Check if user exists
                $record = User::where('custom_id', $user['custom_id'])->first();
                if (!$record) {
                    if (!(isset($user['is_active']) && $user['is_active'])) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new User();
                    $record->custom_id = $user['custom_id'];
                    $record->password = '';

                    if (!isset($user['username']) || (strlen($user['username']) == 0)) {
                        $record->username = $user['custom_id'];
                    }

                    if (!isset($user['is_supervisor'])) {
                        $record->is_supervisor = 0;
                    }

                    if (!isset($user['user_type'])) {
                        $record->user_type = UserType::GUEST();
                    }
                }

                FieldChecker::setField('name', $record, $user, $record->name);
                FieldChecker::setField('is_active', $record, $user, $record->is_active);
                FieldChecker::setField('remember_token', $record, $user, $record->remember_token);
                FieldChecker::setField('email_verified_at', $record, $user, $record->email_verified_at);
                FieldChecker::setField('password', $record, $user, $record->password);
                FieldChecker::setField('chip_number', $record, $user, $record->chip_number);
                FieldChecker::setField('username', $record, $user, $record->username);
                FieldChecker::setField('is_supervisor', $record, $user, $record->is_supervisor);
                FieldChecker::setField('user_type', $record, $user, $record->user_type);
                FieldChecker::setField('user_short_code', $record, $user, $record->user_short_code);

                if(isset($user['hall_id_custom'])) {
                    $record->hall_id = $halls[$user['hall_id_custom']] ?? null;
                }

                $firstSupervisorCustomId = $user['supervisor_1_user'] ?? NULL;
                $secondSupervisorCustomId = $user['supervisor_2_user'] ?? NULL;

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

                if (isset($user['email']) && strlen($user['email']) > 0) {
                    FieldChecker::setField('email', $record, $user, $record->email);
                } else if (!$record->email) {
                    $record->email = $record->custom_id;
                }

                try {
                    $record->save();
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
}
