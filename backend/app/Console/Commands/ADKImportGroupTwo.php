<?php

namespace App\Console\Commands;

use App\ExternalDataSource\ADKNewExternalDataSource;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Console\Command;

class ADKImportGroupTwo extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:adk_group_two';

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
        $isSessionSet = null;

        try {
            $ds = new ADKNewExternalDataSource();
            $isSessionSet = $ds->setSessionId();
            
            if($isSessionSet) {
                Cache::put('is_canias_group_import', true);

                // ********* import item ***********
                Log::channel('adk_import')->info("
                    Item import started | time: ".now()
                );
                Artisan::call('import_dto:item');
                Log::channel('adk_import')->info("
                    Item import finished | time: ".now()
                );
                // ********* import item end *********

                // ********* import prod order *********
                Log::channel('adk_import')->info("
                    Prod Order import started | time: ".now()
                );
                Artisan::call('import:prodorder');
                Log::channel('adk_import')->info("
                    Prod Order import finished | time: ".now()
                );
                // ********* import prod order end *********

                // logout from canias api
                // $ds->logoutFromServer();
                // Cache::forget('is_canias_group_import');
            } else {
                Log::channel('adk_import')->info(
                    "---------------[ADKImportGroupTwo]: SORRY!! UNABLE TO LOGIN TO THE CANIAS ERP. | time: ".now()."---------------"
                );
            }
        } catch(Exception $exception) {
            Log::channel('adk_import')->info(
                "---------------[ADKImportGroupTwo]: SORRY!! AN EXCEPTION OCCURED. | time: ".now()."---------------\n"
                ."EXCEPTION CODE: ".$exception->getCode()."\n"
                ."EXCEPTION MESSAGE: ".$exception->getMessage()
            );
        } finally {
            if($isSessionSet) {
                // logout from canias api
                $ds->logoutFromServer();
                Cache::forget('is_canias_group_import');
            }
        }

        return 0;
    }
}
