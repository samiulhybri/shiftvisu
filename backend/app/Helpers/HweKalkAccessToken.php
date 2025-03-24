<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class HweKalkAccessToken
{
    private static function fetchAccessToken(): array
    {
        $url = env('CRM_ACCESS_TOKEN_AUTH_URL');
        $response = Http::asForm()->post($url, [
            'client_id' => env('CRM_ACCESS_TOKEN_CLIENT_ID'),
            'client_secret' => env('CRM_ACCESS_TOKEN_CLIENT_SECRET'),
            'scope' => env('CRM_ACCESS_TOKEN_SCOPE'),
            'grant_type' => "client_credentials",
        ]);

        return $response->json();
    }

    public static function getAccessToken(): ?string
    {
        $cached = Cache::get('CRM_ACCESS_TOKEN');
        if ($cached) {
            return $cached;
        }

        $response = self::fetchAccessToken();
        Cache::put('CRM_ACCESS_TOKEN', $response['access_token'], $response['expires_in'] - 10);

        return $response['access_token'] ?? null;
    }

    public static function invalidateAccessToken(): void
    {
        Cache::forget('CRM_ACCESS_TOKEN');
    }
}