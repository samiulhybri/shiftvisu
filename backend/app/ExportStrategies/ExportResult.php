<?php

namespace App\ExportStrategies;

class ExportResult
{
    public bool $success;
    public ?string $message;
    public ?string $httpMethod;
    public ?string $httpUrl;
    public ?string $httpPayload;

    public function __construct(
        bool    $success,
        ?string $message = null,
        ?string $httpMethod = null,
        ?string $httpUrl = null,
        ?string $httpPayload = null
    )
    {
        $this->success = $success;
        $this->message = $message;
        $this->httpMethod = $httpMethod;
        $this->httpUrl = $httpUrl;
        $this->httpPayload = $httpPayload;
    }

    static function SUCCESS(
        ?string $message = null,
        ?string $httpMethod = null,
        ?string $httpUrl = null,
        ?string $httpPayload = null
    ): ExportResult
    {
        return new ExportResult(true, $message, $httpMethod, $httpUrl, $httpPayload);
    }

    static function FAIL(
        ?string $message = null,
        ?string $httpMethod = null,
        ?string $httpUrl = null,
        ?string $httpPayload = null
    ): ExportResult
    {
        return new ExportResult(false, $message, $httpMethod, $httpUrl, $httpPayload);
    }
}