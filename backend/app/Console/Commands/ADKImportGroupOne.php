<?php

namespace App\Console\Commands;

use App\ExternalDataSource\ADKNewExternalDataSource;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Console\Command;

class ADKImportGroupOne extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:adk_group_one';

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

                // ********* import machine *********
                Log::channel('adk_import')->info("
                    Machine import started | time: ".now()
                );
                Artisan::call('import_dto:machine');
                Log::channel('adk_import')->info("
                    Machine import finished | time: ".now()
                );
                // ********* import machine end *********

                // ********* import item ***********
                Log::channel('adk_import')->info("
                    Item import started | time: ".now()
                );
                Artisan::call('import_dto:item');
                Log::channel('adk_import')->info("
                    Item import finished | time: ".now()
                );
                // ********* import item end *********

                // ********* import user ***********
                Log::channel('adk_import')->info("
                    User import started | time: ".now()
                );
                Artisan::call('import_dto:user');
                Log::channel('adk_import')->info("
                    User import finished | time: ".now()
                );
                // ********* import user end *********

                // ********* import hall *********
                Log::channel('adk_import')->info("
                    Hall import started | time: ".now()
                );
                Artisan::call('import:hall');
                Log::channel('adk_import')->info("
                    Hall import finished | time: ".now()
                );
                // ********* import hall end *********

                // ********* import tool *********
                Log::channel('adk_import')->info("
                    Tool import started | time: ".now()
                );
                Artisan::call('import:tool');
                Log::channel('adk_import')->info("
                    Tool import finished | time: ".now()
                );
                // ********* import tool end *********

                // ********* import customer *********
                Log::channel('adk_import')->info("
                    Customer import started | time: ".now()
                );
                Artisan::call('import:customer');
                Log::channel('adk_import')->info("
                    Customer import finished | time: ".now()
                );
                // ********* import customer end *********

                // ********* import supplier *********
                Log::channel('adk_import')->info("
                    Supplier import started | time: ".now()
                );
                Artisan::call('import:supplier');
                Log::channel('adk_import')->info("
                    Supplier import finished | time: ".now()
                );
                // ********* import supplier end *********

                // ********* import machine states *********
                Log::channel('adk_import')->info("
                    Machine States import started | time: ".now()
                );
                Artisan::call('import_dto:machine_states');
                Log::channel('adk_import')->info("
                    Machine States import finished | time: ".now()
                );
                // ********* import machine states end *********

                // ********* import item states *********
                Log::channel('adk_import')->info("
                    Item States import started | time: ".now()
                );
                Artisan::call('import_dto:item_states');
                Log::channel('adk_import')->info("
                    Item States import finished | time: ".now()
                );
                // ********* import item states end *********

                // logout from canias api
                // $ds->logoutFromServer();
                // Cache::forget('is_canias_group_import');
            } else {
                Log::channel('adk_import')->info(
                    "---------------[ADKImportGroupOne]: SORRY!! UNABLE TO LOGIN TO THE CANIAS ERP. | time: ".now()."---------------"
                );
            }
        } catch(Exception $exception) {
            Log::channel('adk_import')->info(
                "---------------[ADKImportGroupOne]: SORRY!! AN EXCEPTION OCCURED. | time: ".now()."---------------\n"
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
