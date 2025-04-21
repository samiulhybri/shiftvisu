<?php

namespace App\Http\Controllers;

use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\StockOperationType;
use App\Models\Equipment;
use App\Models\HandlingUnit;
use App\Models\Item;
use App\Models\ItemPlant;
use App\Models\Machine;
use App\Models\PackagingInstruction;
use App\Models\ProdOrderPosBomPos;
use App\Models\ProdOrderPosOperation;
use App\Models\Stock;
use App\Models\StorageLocation;
use App\Models\TransportOrderPos;
use App\Models\TransportOrderPosDeliveries;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Throwable;

class TransportOrderController extends Controller
{
    protected $stockController;

    public function __construct(StockController $stockController = null)
    {
        $this->stockController = $stockController;
    }

    public function acceptOrder(Request $request)
    {
        try {
            // Validate request data
            $validator = Validator::make($request->all(), [
                'data' => 'required|array|min:1',
                'data.*.transport_order_pos_id' => 'required|integer|exists:transport_order_pos,id',
                'data.*.user_id' => 'required|integer|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $payloads = $request->data;

            $transportOrderPosIds = array_column($payloads, 'transport_order_pos_id');

            // Check if any of the transport orders are already occupied
            $existingDeliveries = TransportOrderPosDeliveries::query()
                ->whereIn('transport_order_pos_id', $transportOrderPosIds)
                ->where('is_completed', false)
                ->exists();

            if ($existingDeliveries) {
                return response("Order already occupied", 409);
            }

            // Prepare bulk insert data
            $deliveries = array_map(fn($payload) => [
                'transport_order_pos_id' => $payload['transport_order_pos_id'],
                'user_id' => $payload['user_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ], $payloads);

            TransportOrderPosDeliveries::insert($deliveries);

            return response()->json(true);
        } catch (\Throwable $th) {
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function doneTransportation(Request $request)
    {
        try {
            $payloads = collect($request['data'] ?? [])->values();
            $isIdUsed = false;
            $userId = null;

            foreach ($payloads as $payload) {
                if (!$payload['transportable_type'] || !$payload['transportable_id']) {
                    return response("Transportable id or type missing!", 403);
                }

                $data = null;
                $res = null;
                if (!$isIdUsed && $payload['id']) {
                    $res = TransportOrderPosDeliveries::query()->findOrFail($payload['id']);

                    $userId = $res['user_id'];
                    $isIdUsed = true;

                    $data = [
                        'transport_order_pos_id' => $payload['transport_order_pos_id'],
                        'id' => $payload['id'],
                        'batch' => $payload['batch'],
                        'transportable_id' => $payload['transportable_id'],
                        'transportable_type' => $payload['transportable_type'],
                        'delivered_quantity' => $payload['delivered_quantity'],
                        'is_completed' => true,
                    ];

                    $res->update($data);
                } else {
                    $transportOrderDelivery = TransportOrderPosDeliveries::query()->create([
                        'transport_order_pos_id' => $payload['transport_order_pos_id'],
                        'batch' => $payload['batch'],
                        'user_id' => $userId,
                        'transportable_id' => $payload['transportable_id'],
                        'transportable_type' => $payload['transportable_type'],
                        'delivered_quantity' => $payload['delivered_quantity'],
                        'is_completed' => true,
                    ]);
                }

                if ($payload['stockId']) {

                    //TODO: Check where to take the stocks from...
                    $stock = Stock::query()->where('id', $payload['stockId'])->firstOrFail();

                    $inputs = [
                        [
                            'stockable_id' => $payload['transportable_id'],
                            'stockable_type' => $payload['transportable_type'],
                            'quantity' => -$payload['delivered_quantity'],
                            'batch' => $payload['batch'],
                            'item_state_id' => $payload['item_state_id'],
                            'serials' => [],
                            'positionable_id' => $stock['positionable_id'],
                            'positionable_type' => $stock['positionable_type'],
                        ]
                    ];

                    $outputs = [
                        [
                            'stockable_id' => $payload['transportable_id'],
                            'stockable_type' => $payload['transportable_type'],
                            'batch' => $payload['batch'],
                            'serials' => [],
                            'quantity' => $payload['delivered_quantity'],
                            'item_state_id' => $payload['item_state_id'],
                            'positionable_id' => $payload['destination_id'],
                            'positionable_type' => $payload['destination_type'],
                        ]
                    ];

                    StockController::moveStocks($inputs, $outputs, StockOperationType::TRANSPORT_ORDER(), $transportOrderDelivery ?? $res);
                } else {
                    $inputs = [];
                    $outputs = [
                        [
                            'stockable_id' => $payload['transportable_id'],
                            'stockable_type' => $payload['transportable_type'],
                            'batch' => $payload['batch'],
                            'serials' => [],
                            'quantity' => $payload['delivered_quantity'],
                            'item_state_id' => $payload['item_state_id'],
                            'positionable_id' => $payload['destination_id'],
                            'positionable_type' => $payload['destination_type'],
                        ]
                    ];

                    StockController::moveStocks($inputs, $outputs, StockOperationType::TRANSPORT_ORDER(), $transportOrderDelivery ?? $res);
                }
            }

            return response()->json(true);
        } catch (Throwable $th) {
            return response()->json($th->getMessage(), 500);
        }
    }

    /**
     * @param $orderId
     * @return JsonResponse
     */
    public function getTransportOrderPos($orderId): JsonResponse
    {
        $query = TransportOrderPos::query();

        // Filter by transport_order_id using the passed $orderId
        $query->where('transport_order_id', $orderId);

        // Expanding relationships
        $expandable = [
            'transportOrderPosDeliveries.user',
            'transportable.item:id,custom_id,name',
            'transportable.item.unitOfMeasure' => function ($query) {
                $query->select('id', 'custom_id', 'name');
            },
            'transportOrder',
            'source' => function ($query) {
                $query->select('id', 'custom_id', 'name');
            },
            'destination' => function ($query) {
                $query->select('id', 'custom_id', 'name');
            },
            'item:id,custom_id,name',
            'responsibleUser:id,custom_id,name',
            'machine:id,custom_id,name',
            'transportOrderType:id,custom_id,name'
        ];

        $query->with($expandable);

        // Fetch results and transform keys to camelCase
        $results = $query->get()->map(function ($item) {
            $data = $item->toArray(); // Convert model to array

            // Rename specific keys for relationships
            return array_merge($data, [
                'transportOrderPosDeliveries' => $data['transport_order_pos_deliveries'],
                'transportOrder' => $data['transport_order'],
                'item' => $data['item'],
                'responsibleUser' => $data['responsible_user'],
                'machine' => $data['machine'],
                'transportOrderType' => $data['transport_order_type'],
            ]);
        });

        // Return the transformed results as JSON
        return response()->json($results);
    }

    public function getAllTransportOrders(Request $request)
    {
        $validatedData = $request->validate([
            'transportOrderType' => ['nullable', 'string'],
            'search' => ['nullable', 'string'],
            'isDone' => ['nullable', 'boolean'],
            'perPage' => ['nullable', 'integer', 'min:1'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $transportOrderType = $validatedData['transportOrderType'] ?? [];
        $transportOrderType = is_array($transportOrderType) ? $transportOrderType : explode(',', $transportOrderType);
        $search = $validatedData['search'] ?? '';
        $isDone = filter_var($validatedData['isDone'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $perPage = $validatedData['perPage'] ?? 15;
        $page = $validatedData['page'] ?? 1;

        $data = TransportOrderPos::query()
            ->when(count($transportOrderType) > 0, function ($query) use ($transportOrderType) {
                $query->whereIn('transport_order_type_id', $transportOrderType);
            })
            ->with([
                'transportOrderType',
                'source' => function ($query) {
                    $query->select('id', 'custom_id', 'name');
                },
                'destination' => function ($query) {
                    $query->select('id', 'custom_id', 'name');
                },
                'transportable.item' => function ($query) {
                    $query->select('id', 'custom_id', 'name', 'unit_of_measure_id');
                },
                'transportable.item.unitOfMeasure' => function ($query) {
                    $query->select('id', 'custom_id', 'name');
                },
                'transportable.stocks' => function ($query) {
                    $query->where('positionable_type', Machine::class);
                },
                'transportOrderPosDeliveries.user' => function ($query) {
                    $query->select('id', 'custom_id', 'name');
                },
                'prodOrderPosBomPos' => function ($query) {
                    $query->select(
                        'id',
                        'quantity_total',
                        'batch',
                        'pos',
                        'qty_for_one_parent',
                        'prod_order_pos_operation_id',
                        'unit_of_measure_id',
                        'prod_order_pos_id',
                        'item_id'
                    )->with([
                        'unitOfMeasure:id,custom_id,name',
                        'prodOrderPos:id,quantity,prod_order_id',
                        'prodOrderPos.prodOrder:id,plant_id_production'
                    ]);
                },
                'transportOrder',
                'item',
                'responsibleUser:id,custom_id,name',
                'machine' => function ($query) {
                    $query->select('id', 'custom_id', 'name', 'hall_id')
                        ->with('hall:id,custom_id,name,is_active');
                }
            ])
            ->where('is_completed', $isDone)
            ->orderBy('id')
            ->get();

        $filteredData = $data ?? collect();

        // Apply Global Search
        if (!empty($search)) {
            $filteredData = $data->filter(function ($transportOrderPos) use ($search) {
                return str_contains(strtolower($transportOrderPos?->transportOrder?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->machine?->hall?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->responsibleUser?->name ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->machine?->name ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->machine?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->transportOrderType?->name ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->itemPlant?->item?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->handlingUnit?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->equipment?->custom_id ?? ''), strtolower($search));
            });
        }

        // Apply pagination
        $paginatedData = $filteredData->forPage($page, $perPage)->values();

        // Preserve existing map and result structure
        $result = $paginatedData->map(function ($transportOrderPos) {
            $totalStocks = 0;
            $stockId = null;

            if ($transportOrderPos->transportable && $transportOrderPos->transportable->stocks) {
                $filteredStocks = $transportOrderPos->transportable->stocks
                    ->where('positionable_type', Machine::class)
                    ->where('positionable_id', $transportOrderPos->machine_id);

                $totalStocks = $filteredStocks->sum('quantity') ?? 0;
                $stockId = $filteredStocks->first()?->id;
            }


            $deliveryPos = $transportOrderPos->transportOrderPosDeliveries->Where('is_completed', false)->first();
            $transportOrderPosDeliveries = $deliveryPos ? [$deliveryPos] : [];
            return [
                'id' => $transportOrderPos->id,
                'prod_order_pos_bom_pos_id' => $transportOrderPos->prod_order_pos_bom_pos_id,
                'transport_order_id' => $transportOrderPos->transport_order_id,
                'responsible_user_id' => $transportOrderPos->responsible_user_id,
                'item_state_id' => $transportOrderPos->item_state_id,
                'transport_order_type_id' => $transportOrderPos->transport_order_type_id,
                'pos' => $transportOrderPos->pos,
                'quantity' => $transportOrderPos->quantity,
                'status' => $transportOrderPos->status,
                'is_accepted' => (bool)$transportOrderPos->is_accepted,
                'is_urgent' => (bool)$transportOrderPos->is_urgent,
                'is_completed' => (bool)$transportOrderPos->is_completed,
                'entry_date' => $transportOrderPos->entry_date,
                'created_at' => $transportOrderPos->created_at,
                'updated_at' => $transportOrderPos->updated_at,
                'transportable_type' => $transportOrderPos->transportable_type,
                'transportable_id' => $transportOrderPos->transportable_id,
                'source_type' => $transportOrderPos->source_type,
                'source_id' => $transportOrderPos->source_id,
                'destination_type' => $transportOrderPos->destination_type,
                'destination_id' => $transportOrderPos->destination_id,
                'source' => $transportOrderPos->source,
                'destination' => $transportOrderPos->destination,
                'prodOrderPosBomPos' => [
                    'id' => $transportOrderPos->prodOrderPosBomPos?->id ?? null,
                    'quantity_total' => $transportOrderPos->prodOrderPosBomPos?->quantity_total ?? null,
                    'batch' => $transportOrderPos->prodOrderPosBomPos?->batch ?? null,
                    'pos' => $transportOrderPos->prodOrderPosBomPos?->pos ?? null,
                    'prod_order_pos_id' => $transportOrderPos->prodOrderPosBomPos?->prod_order_pos_id ?? null,
                    'prod_order_pos_operation_id' => $transportOrderPos->prodOrderPosBomPos?->prod_order_pos_operation_id ?? null,
                    'unit_of_measure_id' => $transportOrderPos->prodOrderPosBomPos?->unit_of_measure_id ?? null,
                    'qty_for_one_parent' => $transportOrderPos->prodOrderPosBomPos?->qty_for_one_parent ?? null,
                    'unitOfMeasure' => $transportOrderPos->prodOrderPosBomPos?->unitOfMeasure
                        ? [
                            'custom_id' => $transportOrderPos->prodOrderPosBomPos?->unitOfMeasure?->custom_id,
                            'name' => $transportOrderPos->prodOrderPosBomPos?->unitOfMeasure?->name,
                        ]
                        : null,
                    'prodOrderPos' => $transportOrderPos->prodOrderPosBomPos?->prodOrderPos
                        ? [
                            'quantity' => $transportOrderPos->prodOrderPosBomPos?->prodOrderPos?->quantity,
                            'prodOrder' => [
                                'plant_id_production' => $transportOrderPos->prodOrderPosBomPos?->prodOrderPos?->prodOrder?->plant_id_production
                            ]
                        ]
                        : null,
                ],
                'transportOrder' => $transportOrderPos->transportOrder,
                'item' => $transportOrderPos->item,
                'unitOfMeasure' => $transportOrderPos?->transportable?->item?->unitOfMeasure,
                'machine' => [
                    'id' => $transportOrderPos->machine->id ?? null,
                    'custom_id' => $transportOrderPos->machine?->custom_id ?? null,
                    'name' => $transportOrderPos->machine?->name ?? null,
                    'hall' => $transportOrderPos->machine?->hall ?? null,
                ],
                'responsibleUser' => $transportOrderPos->responsibleUser,
                'transportOrderPosDeliveries' => $transportOrderPosDeliveries,
                'transportOrderType' => $transportOrderPos->transportOrderType,
                'itemPlant' => $transportOrderPos->transportable_type === ItemPlant::class
                    ? collect($transportOrderPos->transportable)->except('stocks')
                    : null,
                'handlingUnit' => $transportOrderPos->transportable_type === HandlingUnit::class ? collect($transportOrderPos->transportable)->except('stocks') : null,
                'equipment' => $transportOrderPos->transportable_type === Equipment::class ? collect($transportOrderPos->transportable)->except('stocks') : null,
                'total_stocks' => $totalStocks,
                'delivered_quantity' => $transportOrderPos?->transportOrderPosDeliveries?->sum('delivered_quantity'),
                'stockId' => $stockId,
            ];
        });

        return response()->json($result);
    }

    function getAllTransportOrderCount(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'transportOrderType' => ['nullable', 'string'],
            'search' => ['nullable', 'string'],
            'isDone' => ['nullable', 'boolean'],
        ]);

        $transportOrderType = $validatedData['transportOrderType'] ?? [];
        $transportOrderType = is_array($transportOrderType) ? $transportOrderType : explode(',', $transportOrderType);
        $search = $validatedData['search'] ?? '';
        $isDone = filter_var($validatedData['isDone'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $data = TransportOrderPos::query()
            ->when(count($transportOrderType) > 0, function ($query) use ($transportOrderType) {
                $query->whereIn('transport_order_type_id', $transportOrderType);
            })
            ->with([
                'transportOrderType',
                'transportable.item' => function ($query) {
                    $query->select('id', 'custom_id', 'name');
                },
                'transportable.stocks' => function ($query) {
                    $query->where('positionable_type', Machine::class);
                },
                'transportOrderPosDeliveries.user' => function ($query) {
                    $query->select('id', 'custom_id', 'name');
                },
                'prodOrderPosBomPos' => function ($query) {
                    $query->select(
                        'id',
                        'quantity_total',
                        'batch',
                        'pos',
                        'qty_for_one_parent',
                        'prod_order_pos_operation_id',
                        'unit_of_measure_id',
                        'prod_order_pos_id',
                        'item_id'
                    )->with([
                        'unitOfMeasure:id,custom_id,name',
                        'prodOrderPos:id,quantity,prod_order_id',
                        'prodOrderPos.prodOrder:id,plant_id_production'
                    ]);
                },
                'transportOrder',
                'item',
                'responsibleUser:id,custom_id,name',
                'machine' => function ($query) {
                    $query->select('id', 'custom_id', 'name', 'hall_id')
                        ->with('hall:id,custom_id,name,is_active');
                }
            ])
            ->where('is_completed', $isDone)
            ->orderBy('id')
            ->get();

        $filteredData = $data ?? collect();
        // Apply Global Search
        if (!empty($search)) {
            $filteredData = $data->filter(function ($transportOrderPos) use ($search) {
                return str_contains(strtolower($transportOrderPos?->transportOrder?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->machine?->hall?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->responsibleUser?->name ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->machine?->name ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->machine?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->transportOrderType?->name ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->itemPlant?->item?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->handlingUnit?->custom_id ?? ''), strtolower($search))
                    || str_contains(strtolower($transportOrderPos?->equipment?->custom_id ?? ''), strtolower($search));
            });
        }
        return response()->json(count($filteredData));
    }

    function declineOrder(Request $request)
    {
        $posIds = $request->posIds;

        $res = TransportOrderPosDeliveries::whereIn('id', $posIds)->delete();

        return response()->json($res, 200);
    }

    function getProposeTransportOrderPos(Machine $machine, ProdOrderPosOperation $operation): JsonResponse
    {
        ['positionable_id' => $positionableId, 'positionable_type' => $positionableType] = $machine->getPositionable();
        $itemStateId = $machine?->plant?->item_state_id_default;

        if ($operation->prod_lot_id) {
            $operations = ProdOrderPosOperation::query()
                ->where('prod_lot_id', $operation->prod_lot_id)
                ->whereNotIn('status', [ProdOrderPosOperationStatus::DELETED(), ProdOrderPosOperationStatus::CLOSED()])
                ->get();
        } else {
            $operations = [$operation];
        }

        $processedData = collect();

        foreach ($operations as $singleOperation) {
            $totalAndPSAStocks = $this->stockController->getTotalStocksQuantity($singleOperation)->original;

            ProdOrderPosBomPos::with([
                'prodOrderPos.prodOrder',
                'unitOfMeasure:id,name,custom_id',
                'item.itemPlants',
                'prodOrderPosOperation',
                'warehouse'
            ])
                ->where('prod_order_pos_operation_id', $singleOperation->id)
                ->orderBy('pos')
                ->get()
                ->map(function ($bomPos) use ($positionableType, $positionableId, &$processedData, $totalAndPSAStocks, $itemStateId) {
                    $processedData[] = [
                        'source_id' => $bomPos->storage_location_id,
                        'source_type' => $bomPos->storage_location_id ? StorageLocation::class : null,
                        'destination_id' => $positionableId,
                        'destination_type' => $positionableType,
                        'prodOrderPosOperation' => null,
                        'unitOfMeasure' => $bomPos->unitOfMeasure,
                        'prodOrderPos' => null,
                        'prod_order_pos_operation' => null,
                        'prod_order_pos' => null,
                        'unit_of_measure' => null,
                        'item_type' => $bomPos->item_type,
                        'item_state_id' => $itemStateId,
                        'total_stock_quantity' => $totalAndPSAStocks['total_stock_quantity'],
                        'total_psa_quantity' => $totalAndPSAStocks['total_psa_quantity'],
                        'totalQuantity' => (float)$bomPos->qty_for_one_parent * (float)$bomPos->prodOrderPosOperation->prodOrderPos->quantity,
                        'transportable_type' => ItemPlant::class,
                        'transportable_custom_id' => $bomPos->item?->custom_id,
                        'transportable_name' => $bomPos->item?->name,
                        'transportable_id' => $bomPos->item->itemPlants?->filter(function ($itemPlant) use ($bomPos) {
                            return $itemPlant->plant_id == $bomPos->prodOrderPosOperation->prodOrderPos->prodOrder->plant_id;
                        })?->pluck('id')?->first()
                    ];
                });


            foreach ($singleOperation->prodOrderPosOperationResources()->with('equipment')->get() as $resource) {
                if ($resource->equipment?->is_transport_possible) {
                    $processedData[] = [
                        'source_id' => null,
                        'source_type' => null,
                        'destination_id' => $positionableId,
                        'destination_type' => $positionableType,
                        'item_state_id' => $itemStateId,
                        'prodOrderPosOperation' => null,
                        'unitOfMeasure' => null,
                        'prodOrderPos' => null,
                        'prod_order_pos_operation' => null,
                        'prod_order_pos' => null,
                        'unit_of_measure' => null,
                        'item_type' => null,
                        'total_stock_quantity' => null,
                        'total_psa_quantity' => null,
                        'totalQuantity' => 1,
                        'transportable_type' => Equipment::class,
                        'transportable_custom_id' => $resource->equipment->custom_id,
                        'transportable_name' => $resource->equipment->name,
                        'transportable_id' => $resource->equipment_id,
                    ];
                }
            }

            $processedData = $processedData->merge($singleOperation->getTransportOrderPosForPackaging($machine));

            foreach ($singleOperation->prodInspectionOperations()->with(['prodInspectionOperationResources', 'prodInspectionOperationResources.equipment'])->get() as $prodInspectionOperation) {
                foreach ($prodInspectionOperation->prodInspectionOperationResources as $resource) {
                    if ($resource->equipment?->is_transport_possible) {
                        $processedData[] = [
                            'source_id' => null,
                            'source_type' => null,
                            'destination_id' => $positionableId,
                            'destination_type' => $positionableType,
                            'item_state_id' => $itemStateId,
                            'prodOrderPosOperation' => null,
                            'unitOfMeasure' => null,
                            'prodOrderPos' => null,
                            'prod_order_pos_operation' => null,
                            'prod_order_pos' => null,
                            'unit_of_measure' => null,
                            'item_type' => null,
                            'total_stock_quantity' => null,
                            'total_psa_quantity' => null,
                            'totalQuantity' => 1,
                            'transportable_type' => Equipment::class,
                            'transportable_custom_id' => $resource->equipment->custom_id,
                            'transportable_name' => $resource->equipment->name,
                            'transportable_id' => $resource->equipment_id,
                        ];
                    }
                }
            }


            $results = HandlingUnit::query()
                ->where('is_complete', false)
                ->whereHas('childStocks', function ($query) use ($singleOperation) {
                    $query->where('stockable_type', ItemPlant::class)
                        ->where('stockable_id', $singleOperation->prodOrderPos->itemPlant()->id);
                })->whereHas('parentStock', function ($query) use ($singleOperation) {
                    $query->where('positionable_type', StorageLocation::class)
                        ->where('positionable_id', $singleOperation->prodOrderPos->storage_location_id);
                })
                ->with(['parentStock'])
                ->distinct()
                ->get(['id', 'custom_id']);

            foreach ($results as $result) {
                if ($result->parentStock && $result->parentStock->positionable_type != HandlingUnit::class) {
                    $processedData[] = [
                        'source_id' => $result->parentStock->positionable_id,
                        'source_type' => $result->parentStock->positionable_type,
                        'destination_id' => $positionableId,
                        'destination_type' => $positionableType,
                        'item_state_id' => $result->parentStock->item_state_id,
                        'prodOrderPosOperation' => null,
                        'unitOfMeasure' => null,
                        'prodOrderPos' => null,
                        'prod_order_pos_operation' => null,
                        'prod_order_pos' => null,
                        'unit_of_measure' => null,
                        'item_type' => null,
                        'total_stock_quantity' => null,
                        'total_psa_quantity' => null,
                        'totalQuantity' => 1,
                        'transportable_type' => HandlingUnit::class,
                        'transportable_custom_id' => $result->custom_id,
                        'transportable_name' => null,
                        'transportable_id' => $result->id,
                    ];
                }
            }
        }

        //TODO: Make better sums instead of unique
        return response()->json($processedData->unique()->values());
    }

    /**
     * @param ProdOrderPosOperation $operation
     * @param Machine $machine
     * @return JsonResponse
     */
    public function getTransportOrderPosForPackaging(Machine $machine, ProdOrderPosOperation $operation, PackagingInstruction $packagingInstruction): JsonResponse
    {
        return response()->json($operation->getTransportOrderPosForPackaging($machine, $packagingInstruction));
    }
}