<?php

namespace App\ExternalDataSource;

use App\Enums\ProdOrderPosStatus;
use App\ExternalDataSource\Dto\CallOffDto;
use App\Models\ProdOrderPos;
use Illuminate\Support\Collection;

class IctTestExternalDataSource extends ICTExternalDataSource
{
    public function prodOrders(?string $onlyCustomId, string $ordersTable = "ERP_TO_MES_TEST_AUFTRAEGE"): Collection
    {
        return parent::prodOrders($onlyCustomId, $ordersTable);
    }

    public function callOffDtos(int $skip, int $take): array|false
    {
        $results = ProdOrderPos::with('prodOrder:id,custom_id', "item:id,custom_id")
                    ->whereNotNull('due_date')
                    ->whereNotIn('status', [ProdOrderPosStatus::CLOSED(), ProdOrderPosStatus::DELETED()])
                    ->skip($skip)
                    ->take($take)
                    ->get(['id', 'prod_order_id', 'item_id', 'due_date', 'quantity']);

        $dtos = $results->map(fn($result) => 
                    new CallOffDto(
                        custom_id: $result->prodOrder->custom_id,
                        item_id_custom: $result->item->custom_id,
                        date: $result->due_date,
                        quantity: $result->quantity
                    ))
                    ->all();

        return $dtos;
    }
}
