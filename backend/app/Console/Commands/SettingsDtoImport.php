<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Setting;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class SettingsDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:settings';

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

        $setting = $ds->settingsDto();

        try {
            $record = Setting::first();

            if (!$record) {
                // create new instance
                $record = new Setting();
            }

            $record->email_username = $setting->email_username ?? $record->email_username;
            $record->email_address = $setting->email_address ?? $record->email_address;
            $record->email_password = $setting->email_password ?? $record->email_password;
            $record->email_port = $setting->email_port ?? $record->email_port;
            $record->email_host = $setting->email_host ?? $record->email_host;
            $record->client_name = $setting->client_name ?? $record->client_name;

            $record->save();
        } catch (Exception $e) {
            echo $e->getMessage();
        }

        return 0;
    }
}
