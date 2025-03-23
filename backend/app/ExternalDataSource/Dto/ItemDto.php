<?php

namespace App\ExternalDataSource\Dto;

use Carbon\Carbon;

class ItemDto
{
    public string $custom_id;
    public string $name;
    public bool $is_active;

    public ?bool $image_exists;
    public ?string $image_name;
    public ?string $note;
    public ?string $path_for_image;
    public ?string $image_blob;
    public ?string $file_extension;
    public ?string $custom_operation_plan_id;
    public ?string $custom_bom_id;
    public ?string $item_group_custom_id;
    public ?string $item_type_custom_id;
    public ?string $category;
    public ?bool $is_sales_item;
    public ?float $stock;
    public ?string $hwe_warehouse_material;
    public ?int $hwe_period_month;
    public ?int $hwe_period_year;
    public ?string $hwe_norm_name;
    public ?float $price;
    public ?string $xml_id;
    public ?bool $is_alloy;
    public ?bool $is_packaging_item;
    public ?bool $is_purchased_item;
    public ?bool $is_production_item;
    public ?string $customer_id_custom;
    public ?string $name2;
    public ?string $name3;
    public ?string $total_weight;

    /**
     * @var ItemPlantDto[]
     */
    public array $plants;
    public ?string $unit_of_measure_id_custom;
    public ?string $packaging_instruction_id_custom;
    public ?string $packaging_instruction_id_1_custom;
    public ?string $packaging_instruction_id_2_custom;
    public ?string $packaging_instruction_id_3_custom;
    public ?string $packaging_instruction_id_4_custom;
    public ?string $main_tool_id;
    /**
     * @var UnitOfMeasureConversionDto[]
     */
    public array $unit_of_measure_conversions;
    public ?float $price_plan;
    public ?Carbon $price_plan_date;
    /**
     * @var ClassificationDto[]
     */
    public array $classifications;
    public ?float $packaging_quantity;

    public function __construct(
        string  $custom_id,
        string  $name,
        bool    $is_active = true,
        ?bool   $image_exists = null,
        ?string $image_name = null,
        ?string $path_for_image = null,
        ?string $image_blob = null,
        ?string $file_extension = '.jpg',
        ?string $custom_operation_plan_id = null,
        ?string $custom_bom_id = null,
        ?string $item_group_custom_id = null,
        ?string $item_type_custom_id = null,
        ?string $category = null,
        ?bool   $is_sales_item = null,
        ?float  $stock = null,
        ?string $hwe_warehouse_material = null,
        ?int    $hwe_period_month = null,
        ?int    $hwe_period_year = null,
        ?string $hwe_norm_name = null,
        ?float  $price = null,
        bool    $is_alloy = false,
        array   $plants = [],
        ?string $unit_of_measure_id_custom = null,
        ?string $packaging_instruction_id_custom = null,
        ?string $packaging_instruction_id_1_custom = null,
        ?string $packaging_instruction_id_2_custom = null,
        ?string $packaging_instruction_id_3_custom = null,
        ?string $packaging_instruction_id_4_custom = null,
        ?string $note = null,
        array   $unit_of_measure_conversions = [],
        ?string $xml_id = null,
        ?float  $price_plan = null,
        array   $classifications = [],
        ?float  $packaging_quantity = null,
        ?Carbon $price_plan_date = null,
        ?bool $is_packaging_item = false,
        ?bool $is_purchased_item = false,
        ?bool $is_production_item = false,
        ?string $customer_id_custom = null,
        ?string $name2 = null,
        ?string $name3 = null,
        ?string $main_tool_id = null,
        ?string $total_weight = null
    )
    {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->is_active = $is_active;
        $this->image_exists = $image_exists;
        $this->image_name = $image_name;
        $this->path_for_image = $path_for_image;
        $this->image_blob = $image_blob;
        $this->file_extension = $file_extension;
        $this->custom_operation_plan_id = $custom_operation_plan_id;
        $this->custom_bom_id = $custom_bom_id;
        $this->item_group_custom_id = $item_group_custom_id;
        $this->item_type_custom_id = $item_type_custom_id;
        $this->category = $category;
        $this->is_sales_item = $is_sales_item;
        $this->stock = $stock;
        $this->hwe_warehouse_material = $hwe_warehouse_material;
        $this->hwe_period_month = $hwe_period_month;
        $this->hwe_period_year = $hwe_period_year;
        $this->hwe_norm_name = $hwe_norm_name;
        $this->price = $price;
        $this->xml_id = $xml_id;
        $this->is_alloy = $is_alloy;
        $this->plants = $plants;
        $this->unit_of_measure_id_custom = $unit_of_measure_id_custom;
        $this->packaging_instruction_id_custom = $packaging_instruction_id_custom;
        $this->packaging_instruction_id_1_custom = $packaging_instruction_id_1_custom;
        $this->packaging_instruction_id_2_custom = $packaging_instruction_id_2_custom;
        $this->packaging_instruction_id_3_custom = $packaging_instruction_id_3_custom;
        $this->packaging_instruction_id_4_custom = $packaging_instruction_id_4_custom;
        $this->unit_of_measure_conversions = $unit_of_measure_conversions;
        $this->price_plan = $price_plan;
        $this->classifications = $classifications;
        $this->packaging_quantity = $packaging_quantity;
        $this->price_plan_date = $price_plan_date;
        $this->note = $note;
        $this->is_packaging_item = $is_packaging_item;
        $this->is_purchased_item = $is_purchased_item;
        $this->is_production_item = $is_production_item;
        $this->customer_id_custom = $customer_id_custom;
        $this->name2 = $name2;
        $this->name3 = $name3;
        $this->main_tool_id = $main_tool_id;
        $this->total_weight = $total_weight;
    }
}
