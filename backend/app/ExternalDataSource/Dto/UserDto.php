<?php

namespace App\ExternalDataSource\Dto;

class UserDto
{
    public string $custom_id;
    public string $name;
    public ?string $username;
    public bool $is_active;
    public bool $is_supervisor;
    public ?string $user_type;
    public ?string $password;
    public ?string $remember_token;
    public ?string $email_verified_at;
    public ?string $chip_number;
    public ?string $user_short_code;
    public ?string $supervisor_1_id_custom;
    public ?string $supervisor_2_id_custom;
    public ?string $email;
    public ?string $xml_id;
    public ?array $userGroupDtos;

    public function __construct(
        string  $custom_id,
        string  $name,
        ?string  $user_type = null,
        ?string  $password = null,
        ?string $username = null,
        bool    $is_active = true,
        bool    $is_supervisor = false,
        ?string $remember_token = null,
        ?string $email_verified_at = null,
        ?string $chip_number = null,
        ?string $user_short_code = null,
        ?string $supervisor_1_id_custom = null,
        ?string $supervisor_2_id_custom = null,
        ?string $email = null,
        ?string $xml_id = null,
        ?array $userGroupDtos = null,
    )
    {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->username = $username;
        $this->is_active = $is_active;
        $this->is_supervisor = $is_supervisor;
        $this->user_type = $user_type;
        $this->password = $password;
        $this->remember_token = $remember_token;
        $this->email_verified_at = $email_verified_at;
        $this->chip_number = $chip_number;
        $this->user_short_code = $user_short_code;
        $this->supervisor_1_id_custom = $supervisor_1_id_custom;
        $this->supervisor_2_id_custom = $supervisor_2_id_custom;
        $this->email = $email;
        $this->xml_id = $xml_id;
        $this->userGroupDtos = $userGroupDtos;
    }
}
