<?php

namespace App\ExternalDataSource\Dto;

class MachineProdOrderPosOperationTimeDto
{
    public string $machine_id_custom;
    public string $prod_order_id_custom;
    public string $prod_order_pos_item_id_custom;
    public string $prod_order_pos_operation_pos;
    public string $start;
    public ?string $end;
    public string $status;

    public function __construct(
        string  $machine_id_custom,
        string  $prod_order_id_custom,
        string  $prod_order_pos_item_id_custom,
        string  $prod_order_pos_operation_pos,
        string  $start,
        ?string $end,
        string  $status
    )
    {
        $this->machine_id_custom = $machine_id_custom;
        $this->prod_order_id_custom = $prod_order_id_custom;
        $this->prod_order_pos_item_id_custom = $prod_order_pos_item_id_custom;
        $this->prod_order_pos_operation_pos = $prod_order_pos_operation_pos;
        $this->start = $start;
        $this->end = $end;
        $this->status = $status;
    }
}