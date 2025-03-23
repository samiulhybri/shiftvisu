<?php

namespace App\ExternalDataSource;

use Exception;
use Illuminate\Support\Facades\DB;

class BaseVisuComboDataSource
{
    private $comboDataType; 

    function __construct($type = 1)
    {
        $this->comboDataType = $type; 
    }

    public function getData() {
        try {
            $data = DB::connection('base_visu')
            ->table('t_base_combo')
            ->where('type', '=', $this->comboDataType)
            ->get()
            ->all(); 
            return $data;  
        } catch (Exception $exception) {
            return $exception; 
        }
    }
}
