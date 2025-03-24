<?php

namespace App\Http\Controllers;

use App\Console\Commands\DepartmentDtoImport;
use App\Console\Commands\HallImport;
use App\Console\Commands\ItemGroupImport;
use App\Console\Commands\ItemDtoImport;
use App\Console\Commands\MachineDtoImport;
use App\Console\Commands\ResourceGroupImport;
use App\Console\Commands\ToolImport;
use App\Console\Commands\ToolDtoImport;
use App\Console\Commands\TpmGroupDtoImport;
use App\Console\Commands\TpmSubGroupDtoImport;
use App\Console\Commands\UserDtoImport;
use App\Console\Commands\UserGroupImport;
use App\Contracts\JpiImportStrategy;
use App\Models\ProdOrder;
use Illuminate\Support\Facades\Artisan;

class BaseDataImportController extends Controller
{
    public function tpmGroupsSync()
    {
        (new TpmGroupDtoImport())->handle();
    }

    public function tpmSubGroupsSync()
    {
        (new TpmSubGroupDtoImport())->handle();
    }

    public function machinesSync()
    {
        Artisan::call('import_dto:machine');
    }

    public function departmentsSync()
    {
        (new DepartmentDtoImport())->handle();
    }

    public function itemsSync()
    {
        (new ItemDtoImport())->handle();
    }

    public function itemGroupsSync()
    {
        (new ItemGroupImport())->handle();
    }

    public function toolsSync()
    {
        if(env('EXTERNAL_DS_TARGET') == 'vop') {
            (new ToolDtoImport())->handle();
        }else {
            (new ToolImport())->handle();
        }
    }

    public function usersSync()
    {
        (new UserDtoImport())->handle();
    }

    public function userGroupsSync()
    {
        (new UserGroupImport())->handle();
    }

    public function hallsSync()
    {
        (new HallImport())->handle();
    }

    public function resourceGroupsSync()
    {
        (new ResourceGroupImport())->handle();
    }

    public function prodOrdersSync(?string $prodOrderCustomId = null, $needJpiImport = 1)
    {
        Artisan::call('import:prodorder', [
            'custom_id' => $prodOrderCustomId
        ]);

        if (env('EXTERNAL_DS_TARGET') != 'ict' && env('EXTERNAL_DS_TARGET') != 'ict_test') {
            Artisan::call('import_dto:prodorder', [
                'custom_id' => $prodOrderCustomId
            ]);
        }

        if ($prodOrderCustomId && env('EXTERNAL_DS_TARGET') == 'ict') {
            if ($imported = ProdOrder::query()->whereLike('custom_id', "%$prodOrderCustomId%")->first()) {
                $prodOrderPosIds = [];
                $prodOrderPosOperationIds = [];

                foreach ($imported->prodOrderPos as $prodOrderPos) {
                    $prodOrderPosIds[] = $prodOrderPos->id;
                    foreach ($prodOrderPos->prodOrderPosOperations as $prodOrderPosOperation) {
                        $customIdHall = $prodOrderPosOperation?->machine?->hall?->custom_id;
                        if(isset($customIdHall) && collect(['DZ-VERBINDUNGSTECHNIK', 'BK-HYDRAULISCH'])->contains($customIdHall))
                            $prodOrderPosOperationIds[] = $prodOrderPosOperation->id;
                    }
                }

                if(count($prodOrderPosOperationIds)) {
                    resolve(JpiImportStrategy::class)->importJpiJobs($imported->custom_id);
                    (new JpiController())->cloudUploadJobsWithTasks($prodOrderPosIds, $prodOrderPosOperationIds);
                }
            } else {
                return response()->json([
                    'message' => 'ProdOrder with custom_id ' . $prodOrderCustomId . ' not found.'
                ], 404);
            }
        }
    }
}
