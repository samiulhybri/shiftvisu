<?php

namespace App\Http\Controllers;

use App\Enums\DataExportName;
use App\Enums\ProdOrderPosOperationHandlingUnitType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\StockOperationType;
use App\Models\DataExport;
use App\Models\Equipment;
use App\Models\HandlingUnit;
use App\Models\Item;
use App\Models\ItemPlant;
use App\Models\Machine;
use App\Models\MachineProdOrderPosOperationTime;
use App\Models\ProdOrder;
use App\Models\ProdOrderPosOperation;
use App\Models\ProdOrderPosBomPos;
use App\Enums\ItemStateType;
use App\Models\ProdOrderPosOperationBatch;
use App\Models\ProdOrderPosOperationHandlingUnit;
use App\Models\ProductionSupplyArea;
use App\Models\Stock;
use App\Models\StockOperation;
use App\Models\StorageLocation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Throwable;

class StockController extends Controller
{
    private static array $stockOperationValidationRules = [
        '*.quantity' => 'required|numeric',
        '*.serials' => 'nullable|array',
        '*.serials.*' => 'string',
        '*.batch' => 'nullable|string',
        '*.stockable_type' => 'required|string',
        '*.stockable_id' => 'required|integer',
        '*.positionable_id' => 'nullable|integer',
        '*.positionable_type' => 'nullable|string',
        '*.item_state_id' => 'integer',
    ];

    public function getTotalStocksQuantity(ProdOrderPosOperation $prodOrderPosOperation)
    {

        $prodOrderBomPos = ProdOrderPosBomPos::with([
            'item.itemPlants',
            'prodOrderPosOperation.prodOrderPos.prodOrder'
        ])
            ->where('prod_order_pos_operation_id', $prodOrderPosOperation->id)
            ->orderBy('id', 'desc')
            ->get();

        $plantId = $prodOrderBomPos->first()?->prodOrderPosOperation?->prodOrderPos?->prodOrder?->plant_id;
        $itemPlantsIds = $prodOrderBomPos->flatMap(function ($bomPos) use ($plantId) {
            return $bomPos->item->itemPlants->filter(function ($itemPlant) use ($plantId) {
                return $itemPlant->plant_id == $plantId;
            })->pluck('id');
        })->unique()->toArray();

        if (empty($itemPlantsIds)) {
            return response()->json(['message' => 'No itemPlants found']);
        }

        // totalStockQuantity for stocks
        $totalStockQuantity = Stock::query()->whereIn('stockable_id', $itemPlantsIds)
            ->where('stockable_type', ItemPlant::class)
            ->whereHas('itemState', function ($query) {
                $query->whereIn('item_state_type', [ItemStateType::GOOD(), ItemStateType::REWORK()]);
            })
            ->sum('quantity');

        // totalPSAQuantity for PSA
        $totalPSAQuantity = Stock::query()->whereIn('stockable_id', $itemPlantsIds)
            ->where('stockable_type', ItemPlant::class)
            ->where('positionable_type', ProductionSupplyArea::class)
            ->whereHas('itemState', function ($query) {
                $query->whereIn('item_state_type', [ItemStateType::GOOD(), ItemStateType::REWORK()]);
            })
            ->sum('quantity');

        return response()->json([
            'total_stock_quantity' => $totalStockQuantity,
            'total_psa_quantity' => $totalPSAQuantity
        ]);
    }

    /**
     * @throws ValidationException
     * @throws Exception
     */
    public static function updateStockQuantity(array $stocks): array
    {
        Validator::make($stocks, StockController::$stockOperationValidationRules)->validate();

        try {
            DB::beginTransaction();

            foreach ($stocks as $stock) {
                $existingStock = Stock::query()->where('stockable_type', $stock['stockable_type'])
                    ->where('stockable_id', $stock['stockable_id'])
                    ->where('positionable_id', $stock['positionable_id'])
                    ->where('positionable_type', $stock['positionable_type'])
                    ->where('batch', $stock['batch'] ?? null)
                    ->where('serial', $stock['serial'] ?? null)
                    ->where('item_state_id', $stock['item_state_id'])
                    ->first();

                $quantity = ($existingStock?->quantity ?? 0) + $stock['quantity'];

                if ($quantity <= 0) {
                    if ($existingStock) {
                        $existingStock->delete();
                    }
                } else {
                    if ($existingStock) {
                        $existingStock->quantity = $quantity;
                        $existingStock->save();
                    } else {
                        Stock::query()->create([
                            'stockable_id' => $stock['stockable_id'],
                            'stockable_type' => $stock['stockable_type'],
                            'positionable_id' => $stock['positionable_id'],
                            'positionable_type' => $stock['positionable_type'],
                            'batch' => $stock['batch'] ?? null,
                            'serial' => $stock['serial'] ?? null,
                            'item_state_id' => $stock['item_state_id'],
                            'quantity' => $quantity,
                        ]);
                    }
                }
            }

            DB::commit();
        } catch (Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();
            throw $e;
        }
        return $stocks;
    }

    /**
     * @throws ValidationException
     * @throws Exception
     */
    public static function moveStocks(
        array              $inputs,
        array              $outputs,
        StockOperationType $stockOperationType,
        mixed              $context,
                           $userId = null
    ): void
    {
        Validator::make($inputs, StockController::$stockOperationValidationRules)->validate();
        Validator::make($outputs, StockController::$stockOperationValidationRules)->validate();

        $stockOperationInputs = collect();
        foreach ($inputs as $input) {
            if (count($input['serials'] ?? [])) {
                foreach ($input['serials'] as $serial) {
                    $stockOperationInputs->push([
                        'stockable_type' => $input['stockable_type'],
                        'stockable_id' => $input['stockable_id'],
                        'positionable_type' => $input['positionable_type'],
                        'positionable_id' => $input['positionable_id'],
                        'item_state_id' => $input['item_state_id'],
                        'quantity' => 1,
                        'serial' => $serial,
                        'batch' => $input['batch'],
                    ]);
                }
            } else {
                $stockOperationInputs->push([
                    'stockable_type' => $input['stockable_type'],
                    'stockable_id' => $input['stockable_id'],
                    'positionable_type' => $input['positionable_type'],
                    'positionable_id' => $input['positionable_id'],
                    'item_state_id' => $input['item_state_id'],
                    'quantity' => $input['quantity'],
                    'serial' => $input['serial'] ?? null,
                    'batch' => $input['batch'] ?? null,
                ]);
            }
        }

        $stockOperationOutputs = collect();
        foreach ($outputs as $output) {
            if (count($output['serials'] ?? [])) {
                foreach ($output['serials'] as $serial) {
                    $stockOperationOutputs->push([
                        'stockable_type' => $output['stockable_type'],
                        'stockable_id' => $output['stockable_id'],
                        'positionable_type' => $output['positionable_type'],
                        'positionable_id' => $output['positionable_id'],
                        'item_state_id' => $output['item_state_id'],
                        'quantity' => 1,
                        'serial' => $serial,
                        'batch' => $output['batch'] ?? null,
                    ]);
                }
            } else {
                $stockOperationOutputs->push([
                    'stockable_type' => $output['stockable_type'],
                    'stockable_id' => $output['stockable_id'],
                    'positionable_type' => $output['positionable_type'],
                    'positionable_id' => $output['positionable_id'],
                    'item_state_id' => $output['item_state_id'],
                    'quantity' => $output['quantity'],
                    'serial' => $output['serial'] ?? null,
                    'batch' => $output['batch'] ?? null,
                ]);
            }
        }

        try {
            DB::beginTransaction();

            $stockOperation = new StockOperation();
            $stockOperation->user_id = $userId ?? auth()->id();
            $stockOperation->type = $stockOperationType;
            $stockOperation->performed_datetime = now();

            $stockOperation->context()->associate($context);

            $stockOperation->save();
            $stockOperation->stockOperationInputs()->createMany($stockOperationInputs);
            $stockOperation->stockOperationOutputs()->createMany($stockOperationOutputs);

            foreach ($stockOperationInputs as &$stockOperationInput) {
                $stockOperationInput["quantity"] = -$stockOperationInput["quantity"];
            }

            StockController::updateStockQuantity($stockOperationInputs->toArray());
            StockController::updateStockQuantity($stockOperationOutputs->toArray());

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * @throws ValidationException
     */
    public function storeOrUpdateStocks(Request $request): array
    {
        $recordsToStoreOrUpdate = $request->all();
        return StockController::updateStockQuantity($recordsToStoreOrUpdate);
    }

    private function machineSpecificStocksQuery($machineId, Request $request)
    {
        if (!is_numeric($machineId)) {
            return response()->json(['error' => 'Invalid machine ID'], 400);
        }

        // Get query parameters for filtering
        $skip = $request->query('$skip');
        $top = $request->query('$top');

        $prodSupplyAreaId = Machine::query()->where("id", $machineId)
            ->pluck('production_supply_area_id')
            ->first();

        $query = Stock::query();

        if ($prodSupplyAreaId) {
            $query->where(function ($q) use ($machineId, $prodSupplyAreaId) {
                $q->where(function ($subQuery) use ($machineId) {
                    $subQuery->where('positionable_type', Machine::class)
                        ->where('positionable_id', $machineId);
                })->orWhere(function ($subQuery) use ($prodSupplyAreaId) {
                    $subQuery->where('positionable_type', ProductionSupplyArea::class)
                        ->where('positionable_id', $prodSupplyAreaId);
                });
            });
        } else {
            $query->where('positionable_type', Machine::class)
                ->where('positionable_id', $machineId);
        }

        if ($skip) {
            $query->skip($skip);
        }

        if ($top) {
            $query->take($top);
        }
        return $query;
    }

    // Packaging Stocks with machine specific
    public function getMachineSpecificPackagingStocks($machineId, Request $request)
    {
        $query = $this->machineSpecificStocksQuery($machineId, $request);
        $query->where('stockable_type', '!=', HandlingUnit::class)
            ->where('quantity', '>', 0);

        $stocks = $query->get();
        return $this->processStocks($stocks);
    }

    public function getOperationSpecificHandlingUnits($prodOrderPosOpId, Request $request)
    {
        $itemPlantId = $request->query('itemPlantId');

        $handlingUnits = HandlingUnit::query()->join('stocks', function ($join) {
            $join->on('handling_units.id', '=', 'stocks.positionable_id')
                ->where('stocks.positionable_type', '=', HandlingUnit::class);
        })
            ->where(function ($query) use ($prodOrderPosOpId, $itemPlantId) {
                $query->where(function ($q) use ($prodOrderPosOpId) {
                    $q->where('stocks.stockable_type', ProdOrderPosOperation::class)
                        ->where('stocks.stockable_id', $prodOrderPosOpId);
                })
                    ->orWhere(function ($q) use ($itemPlantId) {
                        $q->where('stocks.stockable_type', ItemPlant::class)
                            ->where('stocks.stockable_id', $itemPlantId);
                    });
            })
            ->distinct()
            ->get();

        $parentHandlingUnits = HandlingUnit::query()
            ->join('stocks', function ($join) {
                $join->on('handling_units.id', '=', 'stocks.positionable_id')
                    ->where('stocks.positionable_type', '=', HandlingUnit::class);
            })
            ->where(function ($query) use ($handlingUnits) {
                $query->whereIn('stocks.stockable_id', collect($handlingUnits)->pluck('positionable_id'))
                    ->where('stocks.stockable_type', HandlingUnit::class);
            })
            ->distinct()
            ->get()
            ->map(function ($data) {
                $data->custom_id = $data->custom_id . '-p'; // Symbol of Parent HU
                return $data;
            });

        $response = collect([...$handlingUnits, ...$parentHandlingUnits])
            ->pluck('custom_id')
            ->unique()
            ->values();

        return response()->json($response, 200);
    }

    // Packaging HU with machine specific
    public function getMachineSpecificPackagingHandlingUnits($machineId, Request $request)
    {
        $query = $this->machineSpecificStocksQuery($machineId, $request);
        $query->where('stockable_type', HandlingUnit::class)
            ->where('quantity', '>', 0);

        $stocks = $query->get();
        return $this->processStocks($stocks);
    }

    // Stocks with machine specific
    public function getStocksMachineSpecific($machineId, Request $request)
    {
        $query = $this->machineSpecificStocksQuery($machineId, $request);
        $stocks = $query->get();
        return $this->processStocks($stocks);
    }

    public function getStocks(Request $request)
    {
        // Get query parameters for filtering
        $positionableQuIds = $request->query('positionable_id');
        $positionableQuTypes = $request->query('positionable_type');
        $stockableQuTypes = $request->query('stockable_type');
        $stockableQuIds = $request->query('stockable_id');
        $skip = $request->query('$skip');
        $top = $request->query('$top');

        $query = Stock::query();
        if ($positionableQuIds) {
            if ($positionableQuIds === 'null') {
                $query->whereNull('positionable_id');
            } else if ($positionableQuIds === 'ne null') {
                $query->whereNotNull('positionable_id');
            } else {
                $positionableIdsArray = explode(',', $positionableQuIds);
                $query->whereIn('positionable_id', $positionableIdsArray);
            }
        }

        if ($positionableQuTypes) {
            if ($positionableQuTypes === 'null') {
                $query->whereNull('positionable_type');
            } else if ($positionableQuTypes === 'ne null') {
                $query->whereNotNull('positionable_type');
            } else {
                $positionableTypesArray = explode(',', $positionableQuTypes);
                $query->whereIn('positionable_type', $positionableTypesArray);
            }
        }

        if ($stockableQuIds) {
            if ($stockableQuIds === 'null') {
                $query->whereNull('stockable_id');
            } else if ($stockableQuIds === 'ne null') {
                $query->whereNotNull('stockable_id');
            } else {
                $stockableIdsArray = explode(',', $stockableQuIds);
                $query->whereIn('stockable_id', $stockableIdsArray);
            }
        }

        if ($stockableQuTypes) {
            if ($stockableQuTypes === 'null') {
                $query->whereNull('stockable_type');
            } else if ($stockableQuTypes === 'ne null') {
                $query->whereNotNull('stockable_type');
            } else {
                $stockableTypesArray = explode(',', $stockableQuTypes);
                $query->whereIn('stockable_type', $stockableTypesArray);
            }
        }

        // Apply pagination
        if ($skip) {
            $query = $query->skip($skip);
        }

        if ($top) {
            $query = $query->take($top);
        }

        $stocks = $query->get();
        return $this->processStocks($stocks);
    }

    private function processStocks($stocks)
    {
        $processedStocks = [];
        foreach ($stocks as $stock) {
            $stockableType = $stock->stockable_type;
            $stockableId = $stock->stockable_id;
            $stockData = $stock->toArray();

            if ($stockableType === Item::class) {
                $item = Item::query()->find($stockableId);
                $stockData['handlingUnit'] = null;
                $stockData['item'] = $item ?: null;
            } elseif ($stockableType === HandlingUnit::class) {
                $handlingUnit = HandlingUnit::with('item')->find($stockableId);
                $stockData['handlingUnit'] = $handlingUnit ?: null;
                $stockData['item'] = $handlingUnit ? $handlingUnit->item : null;
                if ($handlingUnit) {
                    $response = $this->getStocksByPositionable(HandlingUnit::class, $handlingUnit->id);
                    $stockData['subRows'] = $response;
                }
            } elseif ($stockableType === ProdOrderPosOperation::class) {
                $prodOrderPosOperation = ProdOrderPosOperation::with('prodOrderPos.item')->find($stockableId);
                $prodOrderPos = $prodOrderPosOperation->prodOrderPos;
                $item = $prodOrderPos->item;
                $itemPlant = $item->itemPlants()->where('plant_id', $prodOrderPos->prodOrder->plant_id)->first();
                $stockData['handlingUnit'] = null;
                $stockData['item'] = $item;
                $stockData['goodsReceiptStorageLocation'] = $prodOrderPos->storageLocation ?? $itemPlant->storageLocation;
            } else {
                $stockData['handlingUnit'] = null;
                $stockData['item'] = null;
            }

            $stockData['itemState'] = $stock->itemState ? $stock->itemState->toArray() : null;
            $processedStocks[] = $stockData;
        }
        return $processedStocks;
    }

    private function getStocksByPositionable($positionableType, $positionableId)
    {
        $stocks = Stock::query()->where('positionable_type', $positionableType)
            ->where('positionable_id', $positionableId)
            ->get();

        return $this->processStocks($stocks);
    }

    public function getHandlingUnitHierarchy(HandlingUnit $handlingUnit)
    {
        return $handlingUnit->hierarchy();
    }

    public function getStocksForProductionSupplyArea(?Machine $machine, Request $request)
    {
        $batches = $request->query('batch') ?? [];
        $stockableIds = $request->query('stockable_id') ?? [];
        $combined = $request->query('combined') ?? [];

        $page = $request->query('page', 1);
        $perPage = $request->query('perPage', 30);
        $checkPositionable = $request->query('checkPositionable', true);
        $removeDuplicateHU = $request->query('removeDuplicateHU', false);
        $isFromEntry = $request->query('isFromEntry', false);

        $batches = is_array($batches) ? $batches : explode(',', $batches);
        $stockableIds = is_array($stockableIds) ? $stockableIds : explode(',', $stockableIds);
        $combined = is_array($combined) ? $combined : explode(',', $combined);

        $stocksQuery = Stock::with(['stockable', 'itemState'])
            ->whereIn('stockable_type', [
                HandlingUnit::class,
                ProdOrderPosOperation::class,
                ItemPlant::class,
                Equipment::class,
            ])
            ->PSAFilter($stockableIds, $batches);

        // Apply machine-specific conditions only if it is necessary
        if ($machine && $checkPositionable) {
            ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $machine->getPositionable();
            $stocksQuery->where('positionable_type', $positionableType)->where('positionable_id', $positionableId);
        }

        $paginator = $stocksQuery->paginate($perPage, ['*'], 'page', $page);

        // Get the collection of items.
        $stocksCollection = $paginator->getCollection();
        $combinedOrder = array_map('strval', $combined);

        // Sort manually using the combined order.
        $sortedStocks = $stocksCollection->sortBy(function ($stock) use ($combinedOrder) {
            // Cast both values to strings for proper comparison.
            $stockId = (string)$stock->stockable_id;
            $batch = (string)$stock->batch;

            // Look for the index in the combined order.
            $idIndex = array_search($stockId, $combinedOrder);
            $batchIndex = array_search($batch, $combinedOrder);

            // Use the smallest index if both exist (or one if only one exists).
            if ($idIndex === false && $batchIndex === false) {
                return PHP_INT_MAX; // Return a very high value to push unsorted items to the end.
            } elseif ($idIndex === false) {
                return $batchIndex;
            } elseif ($batchIndex === false) {
                return $idIndex;
            } else {
                return min($idIndex, $batchIndex);
            }
        })->values();

        $paginator->setCollection($sortedStocks);

        $result = $paginator->getCollection()->map(function ($stock) use ($batches, $isFromEntry, $stockableIds) {
            $expandedStock['item'] = match ($stock->stockable_type) {
                ItemPlant::class => $stock->stockable?->item?->only(['id', 'custom_id']),
                ProdOrderPosOperation::class => $stock->stockable?->prodOrderPos?->item?->only(['id', 'custom_id']),
                default => null,
            };

            $expandedStock = array_merge(
                $stock->toArray(),
                [
                    'unitOfMeasure' => $stock?->stockable?->item?->unitOfMeasure,
                    'stockable' => $stock->stockable,
                ]
            );

            if ($stock->stockable_type === HandlingUnit::class) {
                if ((count($batches) > 0 || count($stockableIds) > 0) && $isFromEntry) {
                    $expandedStock['state_type'] = optional($stock->stockable)
                        ?->prodOrderPosOperationHandlingUnits()
                        ?->where('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
                        ->first();
                } elseif ((count($batches) > 0 || count($stockableIds) > 0)) {
                    $expandedStock['state_type'] = optional($stock->stockable)
                        ?->prodOrderPosOperationHandlingUnits()
                        ?->whereNot('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
                        ->first();
                }
            }


            if ($stock->stockable_type === HandlingUnit::class && $stock->stockable) {
                $expandedStock['subRows'] = collect();

                $processStock = function ($stockableId) use (&$processStock, $stockableIds, $batches, $isFromEntry) {
                    return Stock::with(['itemState'])
                        ->where('positionable_type', HandlingUnit::class)
                        ->where('positionable_id', $stockableId)
                        ->where('quantity', '>', 0)
                        ->get()
                        ->map(function ($subRow) use (&$processStock, $stockableIds, $batches, $isFromEntry) {
                            $subRowArray = array_merge(
                                $subRow->toArray(),
                                [
                                    'stockable' => $subRow->stockable,
                                    'unitOfMeasure' => $subRow->stockable?->item?->unitOfMeasure,
                                    'item' => match ($subRow->stockable_type) {
                                        ItemPlant::class => $subRow->stockable?->item?->only(['id', 'custom_id']),
                                        ProdOrderPosOperation::class => $subRow->stockable?->prodOrderPos?->item?->only(['id', 'custom_id']),
                                        default => null
                                    },
                                ]
                            );

                            if ($subRow->stockable_type === HandlingUnit::class) {
                                if ((count($batches) > 0 || count($stockableIds) > 0) && $isFromEntry) {
                                    $subRowArray['state_type'] = optional($subRow->stockable)
                                        ?->prodOrderPosOperationHandlingUnits()
                                        ?->where('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
                                        ->first();
                                } elseif ((count($batches) > 0 || count($stockableIds) > 0)) {
                                    $subRowArray['state_type'] = optional($subRow->stockable)
                                        ?->prodOrderPosOperationHandlingUnits()
                                        ?->whereNot('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
                                        ->first();
                                }
                            }

                            // Check if stockable_type is also HandlingUnit and process recursively
                            if ($subRow->stockable_type === HandlingUnit::class && $subRow->stockable) {
                                $subRowArray['subRows'] = $processStock($subRow->stockable_id);

                                // Sum quantities of subRows for Handling Unit
                                $subRowArray['quantity'] = $subRowArray['subRows']->sum('quantity');
                            } else {
                                $subRowArray['subRows'] = [];
                            }

                            return $subRowArray;
                        });
                };

                $expandedStock['subRows'] = $processStock($stock->stockable_id);

                // Sum quantities of subRows for Handling Unit
                $expandedStock['quantity'] = $expandedStock['subRows']->sum('quantity');
            } else {
                $expandedStock['subRows'] = [];
            }

            return $expandedStock;
        });

        if ($removeDuplicateHU) {
            // Collect HandlingUnit stockable_ids from subRows
            $handlingUnitIdsInSubRows = $result->flatMap(function ($stock) {
                return collect($stock['subRows'])
                    ->where('stockable_type', HandlingUnit::class)
                    ->pluck('stockable_id');
            })->unique();

            // Remove HandlingUnits from the main list if they exist in subRows
            $result = $result->reject(function ($stock) use ($handlingUnitIdsInSubRows) {
                return $stock['stockable_type'] === HandlingUnit::class && $handlingUnitIdsInSubRows->contains($stock['stockable_id']);
            })->values();
        }

        return response()->json($result);
    }

    public function unlinkProductionSupplyAreaForEntry(Machine $machine, ProdOrderPosOperation $operation, Stock $stock)
    {
        if ($stock->stockable_type == HandlingUnit::class) {
            ProdOrderPosOperationHandlingUnit::query()->where('machine_id', $machine->id)
                ->where('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
                ->where('handling_unit_id', $stock->stockable_id)
                ->delete();
        } else {
            ProdOrderPosOperationBatch::query()->where('machine_id', $machine->id)
                ->where('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
                ->where('batch', $stock->batch)
                ->delete();
        }

        //TODO: Move away from PSA

        $stock->print($operation);

        return response()->json();
    }

    /**
     * @throws ValidationException
     */
    public function scrapStock(Machine $machine, ProdOrderPosOperation $operation, Stock $stock, Request $request)
    {
        $request->validate([
            'qty_to_scrap' => 'nullable|numeric|min:0',
        ]);

        $inputs = collect();
        $consumptions = collect();
        if ($stock->stockable_type == HandlingUnit::class) {
            //If not completely scrapped
            if (!$request->get('qty_to_scrap')) {
                ProdOrderPosOperationHandlingUnit::query()->where('machine_id', $machine->id)
                    ->where('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
                    ->where('handling_unit_id', $stock->stockable_id)
                    ->delete();
            }

            foreach ($stock->stockable->childStocks()->where('stockable_type', ItemPlant::class)->get() as $childStock) {
                $inputs->push([
                    'stockable_type' => $childStock->stockable_type,
                    'stockable_id' => $childStock->stockable_id,
                    'positionable_type' => $childStock->positionable_type,
                    'positionable_id' => $childStock->positionable_id,
                    'item_state_id' => $childStock->item_state_id,
                    'quantity' => -$request->get('qty_to_scrap', $childStock->quantity),
                    'serial' => $childStock->serial,
                    'batch' => $childStock->batch,
                ]);

                $consumptions->push([
                    'item_custom_id' => $childStock->stockable->item->custom_id,
                    'plant_custom_id' => $childStock->stockable->plant->custom_id,
                    'quantity' => $request->get('qty_to_scrap', $childStock->quantity),
                    'batch' => $childStock->batch,
                    'serial' => $childStock->serial,
                    'handling_unit_custom_id' => $stock->stockable->custom_id,
                ]);
            }
        } else if ($stock->stockable_type == ItemPlant::class) {
            //If not completely scrapped
            if (!$request->get('qty_to_scrap')) {
                ProdOrderPosOperationBatch::query()->where('machine_id', $machine->id)
                    ->where('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
                    ->where('batch', $stock->batch)
                    ->delete();
            }

            $inputs->push([
                'stockable_type' => $stock->stockable_type,
                'stockable_id' => $stock->stockable_id,
                'positionable_type' => $stock->positionable_type,
                'positionable_id' => $stock->positionable_id,
                'item_state_id' => $stock->item_state_id,
                'quantity' => -$request->get('qty_to_scrap', $stock->quantity),
                'serial' => $stock->serial,
                'batch' => $stock->batch,
            ]);

            $consumptions->push([
                'item_custom_id' => $stock->stockable->item->custom_id,
                'plant_custom_id' => $stock->stockable->plant->custom_id,
                'quantity' => $request->get('qty_to_scrap', $stock->quantity),
                'batch' => $stock->batch,
                'serial' => $stock->serial,
                'handling_unit_custom_id' => null,
            ]);
        }

        StockController::moveStocks($inputs->toArray(), [], StockOperationType::SCRAP(), $operation);

        $docToExport = DataExport::query()->create([
            "name" => DataExportName::QUANTITY_CONSUMPTION(),
            "data" => json_encode([
                'prod_order_custom_id' => $operation->prodOrderPos->prodOrder->custom_id,
                'posting_date' => now()->toDateTimeString(),
                'consumptions' => $consumptions->toArray(),
            ])
        ]);

        (new ExportController)->singleExport($docToExport);

        return response()->json();
    }

    public function checkBomForScannedText(Machine $machine, Request $request)
    {
        ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $machine->getPositionable();

        try {
            $scannedText = $request->query('scannedText');

            $handlingUnit = HandlingUnit::query()->where('custom_id', ltrim($scannedText, '0'))->first();

            if ($handlingUnit) {
                $request = new Request([
                    'batch' => [],
                    'stockable_id' => [$handlingUnit->id]
                ]);
            } else {
                $request = new Request([
                    'batch' => [$scannedText],
                    'stockable_id' => []
                ]);
            }

            $isAvailable = false;

            // Retrieve all Production Supply Areas (PSA) for the scanned value
            $allPSAForThatScannedValue = $this->getStocksForProductionSupplyArea(null, $request)->original;

            // Get all BOM positions related to operations in production
            $boms = MachineProdOrderPosOperationTime::query()->whereIn('status', [ProdOrderPosOperationStatus::IN_PRODUCTION(), ProdOrderPosOperationStatus::IN_TEARDOWN(), ProdOrderPosOperationStatus::IN_SETUP()])
                ->where('machine_id', $machine->id)
                ->whereNull('end')
                ->with('prodOrderPosOperation.prodOrderPosBomPos:prod_order_pos_operation_id,id,item_id,storage_location_id')
                ->get()
                ->pluck('prodOrderPosOperation.prodOrderPosBomPos')
                ->flatten()
                ->groupBy('item_id');


            foreach ($allPSAForThatScannedValue as $psa) {
                if (
                    isset($psa['stockable_type'], $psa['stockable']['item_id']) &&
                    $psa['stockable_type'] === ItemPlant::class &&
                    $boms->has($psa['stockable']['item_id']) &&
                    (
                        (
                            $psa['positionable_type'] === StorageLocation::class &&
                            $boms->get($psa['stockable']['item_id'])->pluck('storage_location_id')->contains($psa['positionable_id'])
                        ) ||
                        $psa['positionable_type'] === $positionableType
                    )
                ) {
                    $isAvailable = true;
                    break;
                }

                if ($psa['stockable_type'] == HandlingUnit::class) {
                    foreach ($psa['subRows'] as $row) {
                        if (
                            isset($row['stockable_type'], $row['stockable']['item_id']) &&
                            $row['stockable_type'] == ItemPlant::class &&

                            (
                                (
                                    $psa['positionable_type'] === StorageLocation::class &&
                                    $boms->get($row['stockable']['item_id'])->pluck('storage_location_id')->contains($psa['positionable_id'])
                                ) ||
                                $psa['positionable_type'] === $positionableType
                            )
                        ) {
                            $isAvailable = true;
                            break 2;
                        }
                    }
                }
            }

            return response()->json(['isAvailable' => $isAvailable]);
        } catch (Throwable) {
            return response()->json(['isAvailable' => false]);
        }
    }

    public function scanHandlingUnitForExit(Machine $machine, ProdOrderPosOperation $operation, Request $request)
    {
        DB::beginTransaction();
        try {
            foreach ($request->scannedIds as $scannedId) {
                $handlingUnit = HandlingUnit::query()
                    ->where('custom_id', ltrim($scannedId, '0'))
                    ->with('parentStock')
                    ->first();

                if (!$handlingUnit) {
                    return response()->json([
                        "success" => false,
                        "message" => "Handling unit not found."
                    ], 404);
                }

                //Check if hu storage location matches prod_order_pos storage location
                if ($handlingUnit->parentStock->positionable_type === StorageLocation::class && $handlingUnit->parentStock->positionable_id != $operation->prodOrderPos->storage_location_id) {
                    return response()->json(['type' => 'WRONG_STORAGE_LOCATION'], 410);
                }

                $isExist = ProdOrderPosOperationHandlingUnit::where('machine_id', $machine->id)->where('handling_unit_id', $handlingUnit->id)->whereNot('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())->first();
                if ($isExist) {
                    return response()->json(['type' => 'EXISTS'], 409);
                }

                $incompleteChildHu = null;
                $itemStateType = null;
                $hasChildHU = false;

                foreach ($handlingUnit->childStocks()->where('stockable_type', HandlingUnit::class)->get() as $childHuStock) {
                    $hasChildHU = true;
                    $childHU = $childHuStock->stockable;
                    $itemStateType = $childHU->childStocks()->whereIn('stockable_type', [ItemPlant::class, ProdOrderPosOperation::class])->first()->itemState->item_state_type ?? ItemStateType::GOOD();

                    if (!$childHU->isFullWithWipAndItemPlant()) {
                        $incompleteChildHu = $childHU;
                    }
                }

                if (!$itemStateType) {
                    $itemStateType = ItemStateType::from($handlingUnit->childStocks()->whereIn('stockable_type', [ItemPlant::class, ProdOrderPosOperation::class])->first()->itemState->item_state_type) ?? ItemStateType::GOOD();
                }

                $huType = match ($itemStateType) {
                    ItemStateType::SCRAP() => ProdOrderPosOperationHandlingUnitType::PROD_SCRAP(),
                    ItemStateType::REWORK() => ProdOrderPosOperationHandlingUnitType::PROD_REWORK(),
                    default => ProdOrderPosOperationHandlingUnitType::PROD_GOOD(),
                };

                $huTypeLevel2 = match ($itemStateType) {
                    ItemStateType::SCRAP() => ProdOrderPosOperationHandlingUnitType::PROD_SCRAP_LEVEL_2(),
                    ItemStateType::REWORK() => ProdOrderPosOperationHandlingUnitType::PROD_REWORK_LEVEL_2(),
                    default => ProdOrderPosOperationHandlingUnitType::PROD_GOOD_LEVEL_2(),
                };


                if ($incompleteChildHu) {
                    ProdOrderPosOperationHandlingUnit::query()->create([
                        "type" => $huType,
                        "handling_unit_id" => $incompleteChildHu->id,
                        "prod_order_pos_operation_id" => $operation->id,
                        "machine_id" => $machine->id,
                    ]);
                }

                if ($hasChildHU) {
                    ProdOrderPosOperationHandlingUnit::query()->create([
                        "type" => $huTypeLevel2,
                        "handling_unit_id" => $handlingUnit->id,
                        "prod_order_pos_operation_id" => $operation->id,
                        "machine_id" => $machine->id,
                    ]);
                } else {
                    ProdOrderPosOperationHandlingUnit::query()->create([
                        "type" => $huType,
                        "handling_unit_id" => $handlingUnit->id,
                        "prod_order_pos_operation_id" => $operation->id,
                        "machine_id" => $machine->id,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                "success" => true,
                "message" => "Handling unit processed successfully."
            ], 201);
        } catch (Throwable $th) {
            DB::rollBack();
            return response()->json([
                "success" => false,
                "message" => $th->getMessage()
            ], 403);
        }
    }

    public function checkExitForOperations(Machine $machine, Request $request)
    {
        try {
            $operationIds = $request->query('operationIds') ?? [];
            $operationIds = is_array($operationIds) ? $operationIds : explode(',', $operationIds);

            $handlingUnits = ProdOrderPosOperationHandlingUnit::query()->where('machine_id', $machine->id)
                ->where('type', '!=', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())->get()
                ->pluck('handling_unit_id');

            $exitForOperation = [];

            if (count($handlingUnits) > 0) {
                $request = new Request([
                    'batch' => [],
                    'stockable_id' => $handlingUnits?->toArray()
                ]);

                // Retrieve all Production Supply Areas (PSA) for the operations
                $allPSAForThatScannedValue = $this->getStocksForProductionSupplyArea($machine, $request)->original;

                if (count($allPSAForThatScannedValue) > 0) {
                    foreach ($allPSAForThatScannedValue as $psa) {
                        if ($psa['stockable_type'] == HandlingUnit::class) {
                            foreach ($psa['subRows'] as $row) {
                                if ($row['stockable_type'] == ProdOrderPosOperation::class && in_array($row['stockable_id'], $operationIds)) {
                                    $exitForOperation[] = $row;
                                } else if ($row['stockable_type'] == HandlingUnit::class) {
                                    foreach ($row['subRows'] as $stock) {
                                        if ($stock['stockable_type'] == ProdOrderPosOperation::class && in_array($stock['stockable_id'], $operationIds)) {
                                            $exitForOperation[] = $row;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return response()->json([
                "availableExits" => count($exitForOperation)
            ]);
        } catch (Throwable $th) {
            return response()->json(["availableExits" => 0, "error" => $th->getMessage()], 403);
        }
    }

    public function unlinkProductionSupplyAreaForExit(Machine $machine, ProdOrderPosOperation $operation, Stock $stock)
    {
        try {
            if ($stock->stockable_type == HandlingUnit::class) {
                $popoHu = ProdOrderPosOperationHandlingUnit::query()->where('handling_unit_id', $stock->stockable_id)
                    ->where('machine_id', $machine->id)
                    ->whereNot('type', ProdOrderPosOperationHandlingUnitType::CONSUMPTION())
                    ->with(['prodOrderPosOperation', 'handlingUnit'])
                    ->first();

                $linkedHus = collect();

                if ($popoHu->prodOrderPosOperation->prod_lot_id) {
                    $results = ProdOrderPosOperationHandlingUnit::query()
                        ->select('prod_order_pos_operation_handling_units.*')
                        ->join('prod_order_pos_operations', 'prod_order_pos_operations.id', '=', 'prod_order_pos_operation_handling_units.prod_order_pos_operation_id')
                        ->where('prod_order_pos_operations.prod_lot_id', $popoHu->prodOrderPosOperation->prod_lot_id)
                        ->where('prod_order_pos_operation_handling_units.machine_id', $popoHu->machine_id)
                        ->where('prod_order_pos_operation_handling_units.type', $popoHu->type)
                        ->with(['prodOrderPosOperation', 'handlingUnit'])
                        ->get();

                    foreach ($results as $result) {
                        if ($result->handlingUnit?->getCurrentWipAndItemPlant() == $popoHu->handlingUnit?->getCurrentWipAndItemPlant()) {
                            $linkedHus->push($result);
                        }
                    }

                } else {
                    $linkedHus->push($popoHu);
                }

                foreach ($linkedHus as $linkedHu) {
                    $linkedHu->handlingUnit?->createGoodsReceipt($linkedHu->prodOrderPosOperation);
                    $linkedHu->delete();
                }
            }

            return response()->json(['success' => true]);
        } catch (Throwable) {
            return response()->json(['success' => false]);
        }
    }

    public function getStocksForTransportOrder(Request $request)
    {
        try {
            $customIds = is_array($request->scannedId) ? $request->scannedId : explode(',', $request->scannedId);
            $destinationId = $request->destinationId;
            $destinationType = $request->destinationType;

            $batch = [];
            $stockableIds = [];
            $data = null;

            foreach ($customIds as $customId) {
                if ($customId) {
                    $handlingUnit = HandlingUnit::query()->where('custom_id', ltrim($customId, '0'))->first();

                    if ($handlingUnit) {
                        $stockableIds[] = $handlingUnit->id;
                    } else {
                        $batch[] = $customId;
                    }
                }
            }

            if (count($batch) > 0 || count($stockableIds) > 0) {
                $request = new Request([
                    'batch' => $batch,
                    'stockable_id' => $stockableIds
                ]);

                // Retrieve all Production Supply Areas (PSA) for the scanned value
                $allPSAForThatScannedValue = $this->getStocksForProductionSupplyArea(null, $request)->original;

                $filteredUniqueData = collect($allPSAForThatScannedValue)
                    ->map(function ($item) use ($destinationId, $destinationType) {
                        $item['isPresent'] = ($item['positionable_type'] == $destinationType && $item['positionable_id'] == $destinationId);
                        return $item;
                    })
                    ->sortByDesc('isPresent') // Ensure items with isPresent = true come first
                    ->unique(function ($item) {
                        return $item['stockable_type'] === HandlingUnit::class
                            ? $item['stockable_type'] . '-' . $item['stockable_id']
                            : $item['batch'];
                    })
                    ->values(); // Reset indexes

                if (count($filteredUniqueData) > 0) {
                    foreach ($filteredUniqueData as $stock) {
                        $data[] = [
                            "id" => $stock['id'],
                            "quantity" => $stock['stockable_type'] == ItemPlant::class
                                ? $stock['quantity']
                                : ($stock['quantity'] == 0 ? 0 : 1),
                            "batch" => $stock['batch'],
                            "stockable_type" => $stock['stockable_type'],
                            "item_state_id" => $stock['item_state_id'],
                            "stockable_id" => $stock['stockable_id'],
                            "stockable_custom_id" => $stock['stockable']['custom_id'],
                            "positionable_type" => $stock['positionable_type'],
                            "positionable_id" => $stock['positionable_id'],
                            "isPresent" => $stock['isPresent'],
                        ];
                    }
                }

                return $data;
            }
            return [];
        } catch (Throwable $th) {
            return response()->json(['message' => $th->getMessage()]);
        }
    }

    public function getStocksByType($type, $id)
    {
        // Map type strings to class names
        $typeClassMap = [
            'itemPlant' => ItemPlant::class,
            'handlingUnit' => HandlingUnit::class,
            'equipment' => Equipment::class,
        ];

        $stocks = Stock::with(['stockable.item', 'positionable'])
            ->where('stockable_id', $id)
            ->where('stockable_type', $typeClassMap[$type])
            ->where('quantity', '>', 0)
            ->get();

        foreach ($stocks as $stock) {
            if ($stock->positionable_type == HandlingUnit::class) {
                $parent = Stock::with(['positionable'])
                    ->where('stockable_type', HandlingUnit::class)
                    ->where('stockable_id', $stock->positionable_id)
                    ->first();

                if ($parent->positionable_type == HandlingUnit::class) {
                    $parent->parentL2 = Stock::with(['positionable'])
                        ->where('stockable_type', HandlingUnit::class)
                        ->where('stockable_id', $parent->positionable_id)
                        ->first();
                }

                $stock->parent = $parent;
            }
        }

        $processedData = [];

        foreach ($stocks as $stock) {
            $data = [
                "id" => $stock->id,
                "quantity" => $stock->quantity,
                "batch" => $stock->batch,
                "item" => $typeClassMap[$type] == ItemPlant::class ? $stock->stockable?->item?->only(['id', 'custom_id', 'name']) : $stock->stockable,
                'stockable_type' => $stock->stockable_type,
                'stockable_id' => $stock->stockable_id,
                'position' => $stock->positionable,
                'positionable_type' => $stock->positionable_type,
                'positionable_id' => $stock->positionable_id,
                'parentPosition' => $stock->parent,
            ];

            $processedData[] = $data;
        }

        return $processedData;
    }
}
