<?php

namespace App\Http\Controllers;

use App\Console\Commands\HandlingUnitDtoImport;
use App\Console\Commands\PackagingInstructionDtoImport;
use App\Console\Commands\StockDtoImport;
use App\Enums\DataImportName;
use App\ExportStrategies\ExportResult;
use App\ExternalDataSource\Dto\HandlingUnitDto;
use App\ExternalDataSource\Dto\PackagingInstructionDto;
use App\ExternalDataSource\Dto\ProdOrderDto;
use App\ExternalDataSource\Dto\StockDto;
use App\Models\DataImport;
use Illuminate\Support\Facades\Log;

class ImportController extends Controller
{
    public static function tryLock(DataImport $dataImport): bool
    {
        $updated = DataImport::query()
            ->where('id', $dataImport->id)
            ->where('is_imported', false)
            ->where('is_importing', false)
            ->update(['is_importing' => true]);

        $dataImport->refresh();

        return $updated > 0;
    }

    public function import()
    {
        foreach (DataImport::query()->where('is_imported', false)->orderBy("id")->get() as $dataImport) {
            ImportController::singleImport($dataImport);
        }
    }

    public static function singleImport(DataImport $dataImport): ?DataImport
    {
        if (!ImportController::tryLock($dataImport)) {
            return null;
        }

        $dataImport->refresh();
        $result = ExportResult::FAIL("Import did not run");
        try {
            switch (DataImportName::tryFrom($dataImport->name)) {
                case DataImportName::HANDLING_UNIT:
                    $result = ImportController::importHandlingUnit($dataImport);
                    break;
                case DataImportName::STOCK:
                    $result = ImportController::importStock($dataImport);
                    break;
                case DataImportName::PROD_ORDER:
                    $result = ImportController::importProdOrder($dataImport);
                    break;
                case DataImportName::PACKAGING_INSTRUCTION:
                    $result = ImportController::importPackagingInstruction($dataImport);
                    break;
                case DataImportName::DEFAULT_PACKAGING_INSTRUCTION:
                    $result = ImportController::importDefaultPackagingInstruction($dataImport);
                    break;
                case DataImportName::USER:
                    $result = ImportController::importUser($dataImport);
                    break;
                case DataImportName::ITEM:
                    $result = ImportController::importItem($dataImport);
                    break;
                default:
                    break;
            }
        } catch (\Throwable $e) {
            Log::error($e);
            $dataImport->is_importing = false;
            $dataImport->save();
        }

        $dataImport->is_imported = $result->success;
        $dataImport->last_imported_at = now();
        $dataImport->is_importing = false;
        $dataImport->save();

        return $dataImport;
    }

    private static function importHandlingUnit(DataImport $dataImport): ExportResult
    {
        $dto = HandlingUnitDto::fromStdClass($dataImport->data);
        HandlingUnitDtoImport::importHandlingUnit($dto);

        return ExportResult::SUCCESS();
    }

    private static function importStock(DataImport $dataImport): ExportResult
    {
        $dto = StockDto::fromStdClass($dataImport->data);
        StockDtoImport::importStock($dto);

        return ExportResult::SUCCESS();
    }

    private static function importProdOrder(DataImport $dataImport): ExportResult
    {
        $dto = ProdOrderDto::fromStdClass($dataImport->data);
//        ProdOrderDtoImport::importProdOrder($dto);
        return ExportResult::SUCCESS();
    }

    private static function importPackagingInstruction(DataImport $dataImport): ExportResult
    {
        $dto = PackagingInstructionDto::fromStdClass($dataImport->data);
        PackagingInstructionDtoImport::importPackagingInstruction($dto);
        return ExportResult::SUCCESS();
    }

    private static function importDefaultPackagingInstruction(DataImport $dataImport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    private static function importUser(DataImport $dataImport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    private static function importItem(DataImport $dataImport): ExportResult
    {
        return ExportResult::SUCCESS();
    }
}
