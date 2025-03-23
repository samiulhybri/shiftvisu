<?php

namespace App\ExternalDataSource\Dto;

class ProdOrderPosOperationAltMachineDto
{
    public string $pos;
    public string $machine_id_custom;
    public ?float $te = 0.0;
    public ?int $reference_nr = null;

    public function __construct(
        string  $pos,
        ?string $machine_id_custom = null,
        ?float $te = 0.0,
        ?int $reference_nr = null
    )
    {
        $this->pos = $pos;
        $this->machine_id_custom = $machine_id_custom;
        $this->te = $te;
        $this->reference_nr = $reference_nr;
    }
}