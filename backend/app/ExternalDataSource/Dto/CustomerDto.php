<?php

namespace App\ExternalDataSource\Dto;


class CustomerDto
{
    public string $custom_id;
    public string $name;
    public ?string $name2;
    public bool $is_active;
    public ?string $address;
    public ?string $postal_code;
    public ?string $city;
    public ?string $country_id_custom;
    public ?string $sales_group_id_custom;
    public ?string $sales_area_id_custom;
    public ?string $customer_group_id_custom;
    public ?string $sector_id_custom;
    public ?string $telephone;
    public ?string $vat;
    public ?float $total_insured;
    public ?float $total_production;
    public ?float $total_outstanding;
    public ?float $total_revenue;
    public ?string $delivery_term_id_custom;
    public ?string $payment_term_id_custom;
    public ?string $xml_id;

    public function __construct(
        string $custom_id,
        string $name,
        bool $is_active = true,
        ?string $name2 = null,
        ?string $address = null,
        ?string $postal_code = null,
        ?string $city = null,
        ?string $country_id_custom = null,
        ?string $sales_group_id_custom = null,
        ?string $sales_area_id_custom = null,
        ?string $customer_group_id_custom = null,
        ?string $sector_id_custom = null,
        ?string $telephone = null,
        ?string $vat = null,
        ?float $total_insured = null,
        ?float $total_production = null,
        ?float $total_outstanding = null,
        ?float $total_revenue = null,
        ?string $delivery_term_id_custom = null,
        ?string $payment_term_id_custom = null,
        ?string $xml_id = null
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->name2 = $name2;
        $this->is_active = $is_active;
        $this->address = $address;
        $this->postal_code = $postal_code;
        $this->city = $city;
        $this->country_id_custom = $country_id_custom;
        $this->sales_group_id_custom = $sales_group_id_custom;
        $this->sales_area_id_custom = $sales_area_id_custom;
        $this->customer_group_id_custom = $customer_group_id_custom;
        $this->sector_id_custom = $sector_id_custom;
        $this->telephone = $telephone;
        $this->vat = $vat;
        $this->total_insured = $total_insured;
        $this->total_production = $total_production;
        $this->total_outstanding = $total_outstanding;
        $this->total_revenue = $total_revenue;
        $this->delivery_term_id_custom = $delivery_term_id_custom;
        $this->payment_term_id_custom = $payment_term_id_custom;
        $this->xml_id = $xml_id;
    }
}
