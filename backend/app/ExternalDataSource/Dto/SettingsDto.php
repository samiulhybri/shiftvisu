<?php

namespace App\ExternalDataSource\Dto;

class SettingsDto
{
    public ?string $email_username;
    public ?string $email_address;
    public ?string $email_password;
    public ?int $email_port;
    public ?string $email_host;
    public ?string $client_name;

    public function __construct(
        ?string $email_username = null,
        ?string $email_address = null,
        ?string $email_password = null,
        ?int $email_port = null,
        ?string $email_host = null,
        ?string $client_name = null
    ) {
        $this->email_username = $email_username;
        $this->email_address = $email_address;
        $this->email_password = $email_password;
        $this->email_port = $email_port;
        $this->email_host = $email_host;
        $this->client_name = $client_name;
    }
}
