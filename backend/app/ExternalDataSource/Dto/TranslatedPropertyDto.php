<?php

namespace App\ExternalDataSource\Dto;

class TranslatedPropertyDto
{
    public string $language;
    public string $value;

    public function __construct(string $language, string $value)
    {
        $this->language = $language;
        $this->value = $value;
    }

    /**
     * @param string|TranslatedPropertyDto[] $data
     *
     * @return TranslatedPropertyDto[]
     */
    static function from(array|string $data): array
    {
        if (is_string($data)) {
            return [new TranslatedPropertyDto(config("app.fallback_locale"), $data)];
        }

        return $data;
    }
}
