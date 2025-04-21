<?php

namespace App\ExternalDataSource\Dto;

use stdClass;

class ClassificationDto
{
    public ?string $model_type;
    public ?string $model_id_custom;
    public string $class;
    public string $attribute;
    public ?string $value_string;
    public ?float $value_double;
    public ?string $xml_id;

    public function __construct(
        string  $class,
        string  $attribute,
        ?string $model_type = null,
        ?string $model_id_custom = null,
        ?string $value_string = null,
        ?float  $value_double = null,
        ?string $xml_id = null
    )
    {
        $this->model_type = $model_type;
        $this->model_id_custom = $model_id_custom;
        $this->class = $class;
        $this->attribute = $attribute;
        $this->value_string = substr($value_string, 0, 255);
        $this->value_double = $value_double;
        $this->xml_id = $xml_id;
    }

    public static function fromStdClass(stdClass $obj): ClassificationDto
    {
        return new self(
            $obj->class,
            $obj->attribute,
            $obj->model_type ?? null,
            $obj->model_id_custom ?? null,
            $obj->value_string ?? null,
            $obj->value_double ?? null,
            $obj->xml_id ?? null
        );
    }
}