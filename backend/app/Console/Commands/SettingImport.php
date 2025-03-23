<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Setting;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class SettingImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:setting';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command to import mail configs';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();

        $setting = $ds->settings();

        try {
            $record = Setting::first();

            if (!$record) {
                // create new instance
                $record = new Setting();
            }

            FieldChecker::setField('email_username', $record, $setting, $record->email_username);
            FieldChecker::setField('email_address', $record, $setting, $record->email_address);
            FieldChecker::setField('email_password', $record, $setting, $record->email_password);
            FieldChecker::setField('email_port', $record, $setting, $record->email_port);
            FieldChecker::setField('email_host', $record, $setting, $record->email_host);
            FieldChecker::setField('client_name', $record, $setting, $record->client_name);

            $record->save();
        } catch (Exception $e) {
            echo $e->getMessage();
        }

        return 0;
    }
}
